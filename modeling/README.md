# UWT Modeling Project

Вычислительный проект для моделирования, проверки и прогнозирования реализаций Unified Whole Theory (UWT). На русском: ТЕЦ — Теория Единого Целого.

## Цепочка моделирования

```text
U -> A -> Disc -> R -> V -> S -> Time -> d -> v,a -> m,p,F,E,L,H -> psi
```

## Волновая функция из отношений

Модуль `uwt_modeling.wavefunction` строит волновую функцию не как постулат, а как производную от отношений:

- **амплитуда** вклада отношения (i, j) — корень из устойчивости отношения `w_ij = 1 / (1 + Σ|Δd_ij|)`: устойчивые отношения дают доминирующие вклады;
- **фаза** — накопленное действие `S_ij = Σ L_ij·dt` по истории, делённое на `hbar_eff` (в духе интеграла по путям, `exp(i·S/ħ)`);
- `ψ_i(u)` по каждой оси — суперпозиция круговых гауссовых пакетов ширины `wave_sigma` на решётке `Z_N`, нормированная по правилу Борна;
- импульсное представление — унитарная ДПФ-матрица с точным целочисленным приведением аргументов (библиотечный FFT не используется).

### Численная политика (Balansis / АКТ)

Все вычисления ψ идут через Balansis — теорию абсолютной компенсации (АКТ):

- накопления (суммы по истории, суперпозиция, ДПФ, нормировки, проверки) — через ACT-GEMM с компенсацией Неймайера и суммирование Кахана (`Operations.sequence_sum`);
- поэлементные функции (exp, cos, sin, sqrt, log, деления) — через `Operations.compensated_*`;
- решётка и смещения целочисленные, то есть точные;
- сырых numpy-редукций (`np.sum`, FFT, `@`, `np.dot`) в модуле нет — это закреплено статическим тестом по исходнику и runtime-тестом, запрещающим numpy-редукции во время вычисления;
- компенсационные члены каждого этапа возвращаются в результате и в разделе `numerics` отчёта проверок.

`wavefunction_checks` проверяет: правило Борна (нормировка, неотрицательность), унитарность перехода в импульсное представление (Парсеваль), наличие интерференции (отличие |ψ|² от классической смеси пакетов) и произведение неопределённостей Δx·Δp относительно границы `hbar_eff/2` — с компенсационными членами АКТ по каждой проверке.

```python
from uwt_modeling import UWTConfig, RelationalUniverse, relational_wavefunction, wavefunction_checks

universe = RelationalUniverse(UWTConfig())
universe.run()
result = relational_wavefunction(universe)   # psi, probability, momentum_psi, ...
checks = wavefunction_checks(result, universe.cfg)
```

Раздел `wavefunction` также включается в JSON-результат `run_experiment` / CLI `uwt-model`.

## Установка

```powershell
python -m pip install -e .
```

## Запуск

```powershell
uwt-model --steps 200 --parts 24 --out results/run.json
```

Или напрямую:

```powershell
python -m uwt_modeling.cli --steps 200 --parts 24 --out results/run.json
```

## Проверки

```powershell
python -m pip install -e .[test]
pytest
```
