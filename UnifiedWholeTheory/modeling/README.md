# UWT Modeling Project

Вычислительный проект для моделирования, проверки и прогнозирования реализаций Unified Whole Theory (UWT). На русском: ТЕЦ — Теория Единого Целого.

## Цепочка моделирования

```text
U -> A -> Disc -> R -> V -> S -> Time -> d -> v,a -> m,p,F,E,L,H
```

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
