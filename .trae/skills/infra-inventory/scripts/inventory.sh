#!/usr/bin/env bash
# Read-only host inventory. Mutates nothing. Prints no secret values.
# Usage: bash inventory.sh [repo_search_root]   (default /root)
set -u -o pipefail

ROOT="${1:-/root}"
h() { printf '\n===== %s =====\n' "$*"; }
have() { command -v "$1" >/dev/null 2>&1; }

h "HOST"
echo "hostname: $(hostname)";  echo "date:     $(date -Is)"
echo "uptime:   $(uptime -p 2>/dev/null)"
grep PRETTY_NAME /etc/os-release 2>/dev/null
echo "kernel:   $(uname -r)"; echo "cpu:      $(nproc) cores"
free -h | head -3
h "DISK"; df -hT -x tmpfs -x devtmpfs 2>/dev/null; echo "-- swap:"; swapon --show 2>/dev/null || echo none

h "NETWORK"
ip -br addr 2>/dev/null; echo "-- routes:"; ip route 2>/dev/null | head -10
echo "-- dns:"; resolvectl status 2>/dev/null | grep -m4 'DNS Servers' || cat /etc/resolv.conf 2>/dev/null | grep ^nameserver

h "FIREWALL"
if have ufw; then ufw status 2>/dev/null | head -20; fi
if have nft; then nft list ruleset 2>/dev/null | head -20; fi
iptables -S 2>/dev/null | head -15 || true

h "LISTENING PORTS"
ss -tlnp 2>/dev/null | awk 'NR>1{split($6,a,"\"");print $4"\t"a[2]}' | sort -u

h "USERS / SSH / SUDO"
awk -F: '$3>=1000 && $3<65534 {print $1" uid="$3" shell="$7}' /etc/passwd
echo "-- ssh keys present:"; ls -1 ~/.ssh/*.pub 2>/dev/null | xargs -r -n1 basename
echo "-- ssh config hosts:"; grep -i '^Host ' ~/.ssh/config 2>/dev/null || echo "(no ~/.ssh/config)"
echo "-- sshd auth:"; grep -Ei '^(PermitRootLogin|PasswordAuthentication|PubkeyAuthentication)' /etc/ssh/sshd_config 2>/dev/null

h "SCHEDULED WORK"
echo "-- crontab:"; crontab -l 2>/dev/null | grep -Ev '^\s*(#|$)' || echo "(none)"
echo "-- systemd timers:"; systemctl list-timers --no-pager --no-legend 2>/dev/null | head -15 || true

h "SYSTEMD SERVICES (enabled, non-vendor)"
systemctl list-unit-files --state=enabled --no-pager --no-legend 2>/dev/null | head -30

h "DOCKER"
if have docker; then
  docker --version; docker compose version 2>/dev/null
  echo "-- containers:"
  docker ps -a --format '{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' | sort
  echo
  echo "-- by compose project (label, not name prefix):"
  for c in $(docker ps -a --format '{{.Names}}'); do
    printf '%s\t%s\t%s\n' \
      "$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' "$c" 2>/dev/null)" \
      "$c" \
      "$(docker inspect -f '{{.HostConfig.RestartPolicy.Name}} restarts={{.RestartCount}}' "$c" 2>/dev/null)"
  done | sort
  echo
  echo "-- image age vs container:"
  for c in $(docker ps --format '{{.Names}}'); do
    img=$(docker inspect -f '{{.Config.Image}}' "$c" 2>/dev/null)
    printf '%-28s %-52s built=%s\n' "$c" "$img" \
      "$(docker image inspect -f '{{.Created}}' "$img" 2>/dev/null | cut -c1-10)"
  done
  echo; echo "-- networks:"; docker network ls
  echo; echo "-- volumes:"; docker volume ls -q | wc -l; docker volume ls | head -40
  echo; echo "-- disk usage:"; docker system df
else echo "docker: ABSENT"; fi

h "KUBERNETES"
have kubectl && { kubectl version --client 2>/dev/null; kubectl config get-contexts 2>/dev/null; } || echo "kubectl: ABSENT"
have helm && helm version 2>/dev/null || echo "helm: ABSENT"
[ -f ~/.kube/config ] && echo "kubeconfig: present" || echo "kubeconfig: ABSENT"

h "GIT REPOSITORIES under $ROOT"
while IFS= read -r g; do
  r="${g%/.git}"
  printf '%-40s branch=%-20s dirty=%-4s head=%s\n' \
    "$r" \
    "$(git -C "$r" rev-parse --abbrev-ref HEAD 2>/dev/null)" \
    "$(git -C "$r" status --porcelain 2>/dev/null | wc -l)" \
    "$(git -C "$r" log -1 --format='%h %cs' 2>/dev/null)"
  git -C "$r" remote get-url origin 2>/dev/null | sed 's/^/    remote: /'
  git -C "$r" submodule status 2>/dev/null | sed 's/^/    sub: /'
done < <(find "$ROOT" -maxdepth 3 -name .git -not -path '*/node_modules/*' 2>/dev/null | sort)

h "TOOLING"
for t in gh git docker kubectl helm terraform ansible yq jq psql redis-cli node python3 make; do
  printf '%-12s %s\n' "$t" "$(command -v $t 2>/dev/null || echo ABSENT)"
done

h "END"; echo "generated $(date -Is) on $(hostname)"
