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

- накопления (суммы по истории, суперпозиция, ДПФ, нормировки, проверки) — через векторизованный `balansis.numpy_integration`: EFT-суммы (TwoSum), ACT-GEMM, компенсированные поэлементные сложение и умножение;
- поэлементные exp, cos, sin, sqrt, log и деление — **raw numpy без компенсации** (компенсированных float-векторных версий этих операций в Balansis нет; честная карта компенсации — в docstring `balansis_adapter.py`, закреплена тестами);
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

## Реестр экспериментов

Именованные воспроизводимые эксперименты с маркерами достоверности
(THEORY/HYPOTHESIS/MODEL/VERIFIED) живут в `uwt_modeling.experiments_registry`:

```powershell
uwt-model --list-experiments
uwt-model --experiment condensation --parts 12 --steps 100 --out results/condensation.json
```

- `psi_evolution` [MODEL] — снимки ψ по растущему префиксу истории (унитарная динамика ψ — открытая задача);
- `condensation` [MODEL] — отжиг спускает конфигурационную энергию и сужает пакеты ψ при `stability_width_gamma=-0.5`;
- `quantized_distance` [MODEL] — минимальный квант расстояния и зазоры спектра (различающее предсказание монографии);
- `speed_bound_invariance` [MODEL] — максимальная скорость ограничена инвариантом конфигурации на скане параметров;
- `dimensional_reduction` [HYPOTHESIS] — эффективная размерность по скейлингу `N(<r) ~ r^D`.

## Прогноз и энтропия

`forecast_observables` помимо линейной экстраполяции возвращает раздел `models`
с выбором модели по SSE: линейный тренд против экспоненциальной релаксации
`x(t) = x_inf + (x0 − x_inf)·exp(−t/τ)` (numpy-only подбор). Оценка энтропии
переключается флагом `--entropy-estimator {raw,smoothed}` — `smoothed` использует
фиксированные бины и псевдоотсчёты Лапласа (стабильнее между прогонами, MODEL).

## Бенчмарк векторизации

Реальные измерения ускорения АКТ-векторизации (суммы, GEMM) против наивного
цикла по `AbsoluteValue`: `benchmarks/RESULTS.md` (генерируется
`python benchmarks/bench_vectorization.py --full --out benchmarks/RESULTS.md`).

## Проверки

```powershell
python -m pip install -e .[test]
pytest
```
