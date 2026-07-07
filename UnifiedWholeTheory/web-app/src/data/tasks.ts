const balansisPrelude = `from balansis import AbsoluteValue, Operations


def B(value):
    return AbsoluteValue.from_float(float(value))


def balansis_sum(values):
    items = [B(value) for value in values]
    if not items:
        return 0.0, 0.0
    result, compensation = Operations.sequence_sum(items)
    return float(result.to_float()), float(compensation)


class UWTState:
    def __init__(self, relations):
        self.relations = relations
        self.n = len(relations)

    def pairs(self):
        for i in range(self.n):
            for j in range(i + 1, self.n):
                yield i, j, self.relations[i][j]

    def delta_to(self, other):
        deltas = []
        for i in range(self.n):
            for j in range(i + 1, self.n):
                deltas.append(other.relations[i][j] - self.relations[i][j])
        return deltas

    def energy(self):
        value, compensation = balansis_sum(abs(value) for _, _, value in self.pairs())
        return {'E': value, 'compensation': compensation}

    def tau_to(self, other):
        value, compensation = balansis_sum(abs(delta) for delta in self.delta_to(other))
        return {'tau': value, 'compensation': compensation}

    def stability_to(self, other):
        change, c1 = balansis_sum(abs(delta) for delta in self.delta_to(other))
        power_values = []
        for i, j, value in self.pairs():
            power_values.append(abs(value) + abs(other.relations[i][j]))
        power, c2 = balansis_sum(power_values)
        stab = max(0.0, 1.0 - change / max(1.0, power))
        return {'Stab': round(stab, 3), 'change': change, 'compensation': c1 + c2}
`

export const practicalTasks = [
  {
    title: 'Сети и связи',
    problem: 'Найти, какие группы в социальной или технической сети становятся устойчивыми.',
    uwtSolution: 'Считать узлы частями Aᵢ, связи отношениями R(Aᵢ,Aⱼ), а устойчивость — малым изменением отношений.',
    pythonSolution: `def stable_groups(prev, curr, threshold=0.15):
    n = len(curr)
    graph = [[] for _ in range(n)]

    for i in range(n):
        for j in range(i + 1, n):
            change = abs(curr[i][j] - prev[i][j])
            if curr[i][j] > 0 and change <= threshold:
                graph[i].append(j)
                graph[j].append(i)

    seen = [False] * n
    groups = []
    for start in range(n):
        if seen[start]:
            continue
        stack = [start]
        seen[start] = True
        group = []
        while stack:
            node = stack.pop()
            group.append(node)
            for other in graph[node]:
                if not seen[other]:
                    seen[other] = True
                    stack.append(other)
        if len(group) > 1:
            groups.append(group)
    return groups

prev = [[0, .8, .1], [.8, 0, .2], [.1, .2, 0]]
curr = [[0, .82, .7], [.82, 0, .22], [.7, .22, 0]]
print(stable_groups(prev, curr))`,
    actSolution: `${balansisPrelude}

def stable_groups_balansis(prev_relations, curr_relations, threshold=0.15):
    prev = UWTState(prev_relations)
    curr = UWTState(curr_relations)
    graph = [[] for _ in range(curr.n)]
    audit = []

    for i in range(curr.n):
        for j in range(i + 1, curr.n):
            delta = curr.relations[i][j] - prev.relations[i][j]
            delta_abs, compensation = balansis_sum([abs(delta)])
            stable = curr.relations[i][j] > 0 and delta_abs <= threshold
            audit.append({'R': (i, j), 'delta_R': delta, 'compensation': compensation, 'stable': stable})
            if stable:
                graph[i].append(j)
                graph[j].append(i)

    seen = [False] * curr.n
    groups = []
    for start in range(curr.n):
        if seen[start]:
            continue
        stack = [start]
        seen[start] = True
        group = []
        while stack:
            node = stack.pop()
            group.append(node)
            for other in graph[node]:
                if not seen[other]:
                    seen[other] = True
                    stack.append(other)
        if len(group) > 1:
            groups.append(group)
    return {'stable_groups': groups, 'audit': audit}

prev = [[0, .8, .1], [.8, 0, .2], [.1, .2, 0]]
curr = [[0, .82, .7], [.82, 0, .22], [.7, .22, 0]]
print(stable_groups_balansis(prev, curr))`,
  },
  {
    title: 'Устойчивость систем',
    problem: 'Понять, выдержит ли команда, маршрут, сеть серверов или экономика сильное изменение.',
    uwtSolution: 'Измерить Stab(Aᵢ): чем меньше скачки отношений, тем выше устойчивость системы.',
    pythonSolution: `def system_stability(before, after):
    total_change = 0
    total_power = 0

    for i in range(len(before)):
        for j in range(len(before)):
            total_change += abs(after[i][j] - before[i][j])
            total_power += abs(before[i][j]) + abs(after[i][j])

    normal_change = total_change / max(1, total_power)
    return round(max(0, 1 - normal_change), 3)

before = [[0, 4, 2], [4, 0, 3], [2, 3, 0]]
after = [[0, 3, 2], [3, 0, 1], [2, 1, 0]]
print(system_stability(before, after))`,
    actSolution: `${balansisPrelude}

def withstands_shock(before_relations, after_relations, limit=0.72):
    before = UWTState(before_relations)
    after = UWTState(after_relations)
    stability = before.stability_to(after)
    stability['withstands'] = stability['Stab'] >= limit
    stability['decision'] = 'система выдерживает изменение' if stability['withstands'] else 'система требует усиления связей'
    return stability

before = [[0, 4, 2], [4, 0, 3], [2, 3, 0]]
after = [[0, 3, 2], [3, 0, 1], [2, 1, 0]]
print(withstands_shock(before, after))`,
  },
  {
    title: 'Прогноз изменений',
    problem: 'Предсказать нагрузку, движение потоков или вероятность конфликта.',
    uwtSolution: 'Использовать историю состояний S₀→S₁→S₂ и прогнозировать будущие ΔR.',
    pythonSolution: `def forecast_next(history):
    prev = history[-2]
    curr = history[-1]
    n = len(curr)
    predicted = [[0 for _ in range(n)] for _ in range(n)]

    for i in range(n):
        for j in range(n):
            delta = curr[i][j] - prev[i][j]
            predicted[i][j] = curr[i][j] + delta
    return predicted

s0 = [[0, 10], [10, 0]]
s1 = [[0, 13], [13, 0]]
s2 = [[0, 17], [17, 0]]
print(forecast_next([s0, s1, s2]))`,
    actSolution: `${balansisPrelude}

def forecast_relations(history):
    prev = UWTState(history[-2])
    curr = UWTState(history[-1])
    predicted = [[0 for _ in range(curr.n)] for _ in range(curr.n)]
    audit = []

    for i in range(curr.n):
        for j in range(i + 1, curr.n):
            delta = curr.relations[i][j] - prev.relations[i][j]
            value, compensation = balansis_sum([curr.relations[i][j], delta])
            predicted[i][j] = value
            predicted[j][i] = value
            audit.append({'R': (i, j), 'delta_R': delta, 'forecast': value, 'compensation': compensation})
    return {'forecast_state': predicted, 'audit': audit}

s0 = [[0, 10], [10, 0]]
s1 = [[0, 13], [13, 0]]
s2 = [[0, 17], [17, 0]]
print(forecast_relations([s0, s1, s2]))`,
  },
  {
    title: 'Важные узлы',
    problem: 'Найти станции, людей, серверы или агенты, через которые лучше всего описывать систему.',
    uwtSolution: 'Строить локальные центры описания R(Aᵢ, Aⱼ) для каждого узла и сравнивать их информативность.',
    pythonSolution: `def important_nodes(relations):
    scores = []
    for i, row in enumerate(relations):
        strength = sum(abs(value) for value in row)
        diversity = sum(1 for value in row if value != 0)
        scores.append((i, strength * diversity))
    return sorted(scores, key=lambda item: item[1], reverse=True)

relations = [[0, 5, 1, 0], [5, 0, 4, 3], [1, 4, 0, 2], [0, 3, 2, 0]]
print(important_nodes(relations))`,
    actSolution: `${balansisPrelude}

def important_local_centers(relations):
    state = UWTState(relations)
    centers = []
    for i, row in enumerate(state.relations):
        strength, compensation = balansis_sum(abs(value) for value in row)
        diversity = sum(1 for value in row if value != 0)
        informativeness = strength * diversity
        centers.append({'center': i, 'informativeness': informativeness, 'strength': strength, 'compensation': compensation})
    return sorted(centers, key=lambda item: item['informativeness'], reverse=True)

relations = [[0, 5, 1, 0], [5, 0, 4, 3], [1, 4, 0, 2], [0, 3, 2, 0]]
print(important_local_centers(relations))`,
  },
  {
    title: 'Резкие события',
    problem: 'Рано обнаружить сбой сети, кризис, поломку или смену поведения.',
    uwtSolution: 'Искать скачки энергии, скорости изменения отношений и падение устойчивости.',
    pythonSolution: `def relation_energy(state):
    return sum(abs(value) for row in state for value in row) / 2

def relation_speed(a, b):
    total = 0
    for i in range(len(a)):
        for j in range(len(a)):
            total += abs(b[i][j] - a[i][j])
    return total

def detect_events(history, speed_limit=5, energy_jump=4):
    events = []
    for t in range(1, len(history)):
        speed = relation_speed(history[t - 1], history[t])
        energy_delta = abs(relation_energy(history[t]) - relation_energy(history[t - 1]))
        if speed >= speed_limit or energy_delta >= energy_jump:
            events.append({'step': t, 'speed': speed, 'energy_delta': energy_delta})
    return events

history = [[[0, 1], [1, 0]], [[0, 2], [2, 0]], [[0, 9], [9, 0]]]
print(detect_events(history))`,
    actSolution: `${balansisPrelude}

def detect_sharp_events(history, speed_limit=5, energy_jump=4):
    states = [UWTState(state) for state in history]
    events = []
    for t in range(1, len(states)):
        tau = states[t - 1].tau_to(states[t])
        e0 = states[t - 1].energy()
        e1 = states[t].energy()
        energy_delta, compensation = balansis_sum([e1['E'], -e0['E']])
        if tau['tau'] >= speed_limit or abs(energy_delta) >= energy_jump:
            events.append({
                'step': t,
                'delta_R_speed': tau['tau'],
                'energy_delta': energy_delta,
                'compensation': tau['compensation'] + compensation,
            })
    return events

history = [[[0, 1], [1, 0]], [[0, 2], [2, 0]], [[0, 9], [9, 0]]]
print(detect_sharp_events(history))`,
  },
  {
    title: 'Внутреннее время',
    problem: 'Сравнить системы, где по часам прошло одинаково, но изменений было разное количество.',
    uwtSolution: 'Определять время как τ(Sᵢ,Sⱼ): мера различия состояний, а не просто часы.',
    pythonSolution: `def internal_time(a, b):
    tau = 0
    for i in range(len(a)):
        for j in range(len(a)):
            tau += abs(b[i][j] - a[i][j])
    return tau / 2

quiet_start = [[0, 1], [1, 0]]
quiet_end = [[0, 2], [2, 0]]
storm_end = [[0, 12], [12, 0]]
print('тихая система:', internal_time(quiet_start, quiet_end))
print('бурная система:', internal_time(quiet_start, storm_end))`,
    actSolution: `${balansisPrelude}

def compare_internal_time(start_relations, end_variants):
    start = UWTState(start_relations)
    result = {}
    for name, relations in end_variants.items():
        result[name] = start.tau_to(UWTState(relations))
    return result

start = [[0, 1], [1, 0]]
variants = {
    'тихая система': [[0, 2], [2, 0]],
    'бурная система': [[0, 12], [12, 0]],
}
print(compare_internal_time(start, variants))`,
  },
  {
    title: 'ИИ-агенты',
    problem: 'Понять, как группа агентов образует совместное поведение.',
    uwtSolution: 'Моделировать агентов как части, а координацию как устойчивую структуру отношений.',
    pythonSolution: `def agent_coordination(actions_history):
    scores = []
    for step, actions in enumerate(actions_history):
        pairs = 0
        aligned = 0
        agents = list(actions)
        for i in range(len(agents)):
            for j in range(i + 1, len(agents)):
                pairs += 1
                if actions[agents[i]] == actions[agents[j]]:
                    aligned += 1
        scores.append((step, round(aligned / max(1, pairs), 3)))
    return scores

history = [{'a': 'search', 'b': 'wait', 'c': 'search'}, {'a': 'move', 'b': 'move', 'c': 'move'}]
print(agent_coordination(history))`,
    actSolution: `${balansisPrelude}

def agent_coordination_balansis(actions_history):
    result = []
    for step, actions in enumerate(actions_history):
        agents = list(actions)
        aligned_values = []
        pairs = 0
        for i in range(len(agents)):
            for j in range(i + 1, len(agents)):
                pairs += 1
                aligned_values.append(1 if actions[agents[i]] == actions[agents[j]] else 0)
        aligned, compensation = balansis_sum(aligned_values)
        coordination = aligned / max(1, pairs)
        result.append({'step': step, 'Coord': round(coordination, 3), 'aligned_pairs': aligned, 'compensation': compensation})
    return result

history = [{'a': 'search', 'b': 'wait', 'c': 'search'}, {'a': 'move', 'b': 'move', 'c': 'move'}]
print(agent_coordination_balansis(history))`,
  },
]

export const actConcepts = [
  { title: 'AbsoluteValue', text: 'Структурное число, где важна не только величина, но и направление/семантика вычисления.' },
  { title: 'Compensation', text: 'Явная поправка, которая показывает потерю или остаток вычисления вместо молчаливого округления.' },
  { title: 'Singular arithmetic', text: 'Арифметика, где особые случаи не прячутся, а становятся частью модели.' },
  { title: 'Audited semantics', text: 'Вычисление можно проверять: результат и компенсация видны отдельно.' },
]
