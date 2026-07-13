import { loc, type Localized } from '../i18n/language'

export type Slide = {
  id: number
  eyebrow: Localized
  title: Localized
  body: Localized<string[]>
  insight: Localized
  formula?: string
}

export const slides: Slide[] = [
  {
    id: 1,
    eyebrow: loc('Главная идея', 'The core idea'),
    title: loc('Мир — не коробка с вещами', 'The world is not a box of things'),
    body: {
      ru: [
        'Привычная картина мира выглядит так: сначала существует пустое пространство и течёт время, а затем в них появляются предметы — стол, планета, частица. Эта картина настолько привычна, что кажется единственно возможной.',
        'UWT переворачивает порядок причин. Сначала существует только Единое Целое — U. Внутри него выделяются части — A. Между частями возникают отношения — R. И лишь из устойчивых изменений этих отношений постепенно прорастают пространство, время, движение и остальная физика.',
      ],
      en: [
        'The familiar picture of the world goes like this: first there is empty space and flowing time, and then objects appear inside them — a table, a planet, a particle. This picture is so familiar that it seems like the only one possible.',
        'UWT inverts the order of causes. First there is only the Unified Whole — U. Within it, parts are distinguished — A. Between the parts, relations arise — R. And only out of stable changes in these relations do space, time, motion, and the rest of physics gradually grow.',
      ],
    },
    insight: loc(
      'Пространство и время — не сцена, на которой стоит мир. Это декорация, которую мир строит сам из своих внутренних связей.',
      'Space and time are not a stage the world stands on. They are scenery the world builds for itself out of its own internal connections.',
    ),
    formula: 'U → A → Disc → R → S → Space → Time',
  },
  {
    id: 2,
    eyebrow: loc('Одна часть', 'One part'),
    title: loc('Когда сравнивать не с чем', 'When there is nothing to compare with'),
    body: {
      ru: [
        'Представь, что во всём существовании есть только одна-единственная часть. Больше ничего и никого. Можно ли сказать, что она где-то находится — далеко или близко от чего-то? Двигается она или покоится? Прошло ли для неё время?',
        'Ответ — нет ни на один из вопросов. Не потому что не хватает измерительных приборов, а потому что сама постановка вопроса требует хотя бы двух объектов для сравнения. Один объект без пары не создаёт различимости — а значит, не создаёт и повода для пространства или времени.',
      ],
      en: [
        'Imagine that in all of existence there is only one single part. Nothing and no one else. Can you say that it is located somewhere — far from or close to something? Is it moving or at rest? Has time passed for it?',
        'The answer is no to every one of these questions. Not because measuring instruments are lacking, but because the very posing of the question requires at least two objects to compare. A single object without a partner creates no distinguishability — and therefore no occasion for space or time.',
      ],
    },
    insight: loc(
      'Одна точка не бывает ни быстрой, ни медленной, ни близкой, ни далёкой — у одиночества нет физики.',
      'A single point is never fast or slow, near or far — solitude has no physics.',
    ),
    formula: '1 часть ⇒ нет различимости',
  },
  {
    id: 3,
    eyebrow: loc('Две части', 'Two parts'),
    title: loc('Рождение различия', 'The birth of difference'),
    body: {
      ru: [
        'Всё меняется, как только в Едином Целом выделяются две различные части, A₁ и A₂. Само их различие — это ещё не расстояние и не время, а необходимое предварительное условие для них: различимость, Discernibility.',
        'Как только есть различимость, между A₁ и A₂ можно ввести отношение R(A₁, A₂). Это ещё не число и не метрика — но уже зародыш будущей геометрии. Всё, что физика называет «расстоянием» и «интервалом», в UWT выводится именно отсюда.',
      ],
      en: [
        'Everything changes as soon as two distinct parts, A₁ and A₂, are distinguished within the Unified Whole. Their difference in itself is not yet distance or time, but the necessary precondition for both: distinguishability, Discernibility.',
        'Once there is distinguishability, a relation R(A₁, A₂) can be introduced between A₁ and A₂. It is not yet a number or a metric — but it is already the seed of future geometry. Everything physics calls “distance” and “interval” is derived in UWT precisely from here.',
      ],
    },
    insight: loc(
      'Различие — это первый акт рождения физики: до него нет ни близко, ни далеко.',
      'Difference is the first act in the birth of physics: before it there is no near and no far.',
    ),
    formula: 'A₁ ≠ A₂ ⇒ Disc(A₁,A₂) ⇒ R(A₁,A₂)',
  },
  {
    id: 4,
    eyebrow: loc('Цепочка рождения', 'The chain of emergence'),
    title: loc('От различия к формулам', 'From difference to formulas'),
    body: {
      ru: [
        'Дальше запускается цепная реакция определений. Различимость превращается в отношение. Набор отношений всех частей друг с другом образует состояние системы, S. Изменение состояния между двумя моментами становится внутренним временем.',
        'Ни на одном из шагов не постулируется ничего лишнего: каждое следующее понятие строится как производная от предыдущего. Это отличает UWT от подходов, где пространство, время и масса вводятся как отдельные, ничем не связанные первичные сущности.',
      ],
      en: [
        'From here a chain reaction of definitions begins. Distinguishability turns into a relation. The set of relations of all parts with one another forms the state of the system, S. The change of state between two moments becomes internal time.',
        'At no step is anything extra postulated: each next concept is built as a derivative of the previous one. This sets UWT apart from approaches where space, time, and mass are introduced as separate, unconnected primitive entities.',
      ],
    },
    insight: loc(
      'Каждая физическая величина в UWT — не аксиома, а теорема, выведенная из отношений.',
      'In UWT, every physical quantity is not an axiom but a theorem derived from relations.',
    ),
    formula: 'Disc → R → S → Time → d, v, m, p, F, E, L, H',
  },
  {
    id: 5,
    eyebrow: loc('Единое Целое', 'The Unified Whole'),
    title: loc('Всё принадлежит U', 'Everything belongs to U'),
    body: {
      ru: [
        'Единое Целое, U, — это не «очень большая вселенная», а буквально всё, что существует, без остатка. У множества, включающего абсолютно всё, не может быть внешней границы, потому что за границей по определению уже ничего нет.',
        'Отсюда строгое следствие: любая часть или система частей — это подмножество U. Нельзя выйти за пределы U, чтобы взглянуть на него снаружи, приложить к нему внешнюю линейку или включить для него внешние часы. Всё измерительное происходит только изнутри.',
      ],
      en: [
        'The Unified Whole, U, is not “a very large universe” but literally everything that exists, with nothing left over. A totality that includes absolutely everything can have no outer boundary, because beyond that boundary, by definition, there is nothing.',
        'A strict consequence follows: any part or system of parts is a subset of U. One cannot step outside U to look at it from the outside, hold an external ruler up to it, or start an external clock for it. All measurement happens only from within.',
      ],
    },
    insight: loc(
      'У Целого не может быть внешней стороны — иначе оно не было бы целым.',
      'The Whole can have no outside — otherwise it would not be whole.',
    ),
    formula: '∀X: X ⊆ U',
  },
  {
    id: 6,
    eyebrow: loc('Вне пространства', 'Beyond space'),
    title: loc('Вселенная не находится в пространстве', 'The universe is not located in space'),
    body: {
      ru: [
        'Интуиция подсказывает: пространство — это контейнер, а вселенная — его содержимое. UWT утверждает обратное отношение включения: пространство — это структура, которая возникает внутри вселенной, а не вмещает её снаружи.',
        'Формально Space — это проекция сети отношений Struct(R) между частями U. Пока отношений мало или они не устроены геометрически, о пространстве говорить рано. Геометрия появляется вместе с достаточно богатой и согласованной структурой отношений.',
      ],
      en: [
        'Intuition suggests that space is a container and the universe its contents. UWT asserts the opposite relation of inclusion: space is a structure that arises inside the universe, rather than holding it from the outside.',
        'Formally, Space is a projection of the network of relations Struct(R) between the parts of U. While the relations are few, or not organized geometrically, it is too early to speak of space. Geometry appears together with a sufficiently rich and coherent structure of relations.',
      ],
    },
    insight: loc(
      'Не вселенная лежит в пространстве, а пространство прорастает внутри вселенной.',
      'It is not the universe that lies in space — it is space that grows inside the universe.',
    ),
    formula: 'Space ⊂ Struct(R)',
  },
  {
    id: 7,
    eyebrow: loc('Вне времени', 'Beyond time'),
    title: loc('Время не течёт снаружи', 'Time does not flow from outside'),
    body: {
      ru: [
        'Если бы время существовало отдельно от вселенной, можно было бы спросить: а что было «до» появления времени и по каким часам это «до» отмерялось? UWT снимает этот парадокс: никакого внешнего времени нет вовсе.',
        'Время появляется изнутри — как мера различия между состояниями отношений S₁ и S₂. Нет изменения состояния — нет и хода времени. Именно поэтому в системе с абсолютно неизменными отношениями время в физическом смысле попросту не идёт.',
      ],
      en: [
        'If time existed separately from the universe, one could ask: what was there “before” time appeared, and by what clock was that “before” measured? UWT dissolves this paradox: there is no external time at all.',
        'Time appears from within — as a measure of the difference between relation states S₁ and S₂. No change of state — no passage of time. That is precisely why, in a system whose relations never change at all, time in the physical sense simply does not run.',
      ],
    },
    insight: loc(
      'Время — это не река, текущая мимо вселенной, а след, который вселенная оставляет сама на себе, меняясь.',
      'Time is not a river flowing past the universe, but the trace the universe leaves on itself as it changes.',
    ),
    formula: 'Time = T(S₁, S₂)',
  },
  {
    id: 8,
    eyebrow: loc('Центр', 'The center'),
    title: loc('Центра нет — и потому центр везде', 'There is no center — and so the center is everywhere'),
    body: {
      ru: [
        'Раз нет внешней системы координат, невозможно указать единственную привилегированную точку отсчёта — «настоящий» центр вселенной. Любой такой выбор был бы произвольным добавлением того, чего в самой структуре отношений не существует.',
        'Но это не значит, что описание невозможно. Любая часть Aᵢ вполне может послужить локальным центром — точкой, относительно которой удобно описывать остальные части. Просто таких равноправных центров ровно столько, сколько частей во вселенной.',
      ],
      en: [
        'Since there is no external coordinate system, it is impossible to point to a single privileged reference point — the “true” center of the universe. Any such choice would be an arbitrary addition of something that does not exist in the structure of relations itself.',
        'But this does not mean description is impossible. Any part Aᵢ can perfectly well serve as a local center — a point relative to which it is convenient to describe the other parts. There are simply exactly as many such equally valid centers as there are parts in the universe.',
      ],
    },
    insight: loc(
      'Отсутствие абсолютного центра не мешает смотреть на мир из любой точки — это лишь значит, что ни одна точка не привилегированна.',
      'The absence of an absolute center does not prevent us from viewing the world from any point — it only means that no point is privileged.',
    ),
    formula: 'Center(Aᵢ) — локальная система отсчёта, не абсолютная',
  },
  {
    id: 9,
    eyebrow: loc('Монография', 'The monograph'),
    title: loc('От метафоры к аксиоматике', 'From metaphor to axiomatics'),
    body: {
      ru: [
        'Идея «отношения рождают пространство и время» звучит красиво, но остаётся философией, пока не записана на языке математики. Поэтому в проекте создана полная монография: первичные понятия, аксиомы, определения, теоремы и доказательства.',
        'Это превращает UWT в формальную исследовательскую программу, а не набор аналогий: у теории появляется точный словарь, проверяемые утверждения и строгий вывод от аксиом к следствиям — так же, как это устроено в любой зрелой физической теории.',
      ],
      en: [
        'The idea that “relations give birth to space and time” sounds beautiful, but it remains philosophy until it is written in the language of mathematics. That is why the project includes a complete monograph: primitive notions, axioms, definitions, theorems, and proofs.',
        'This turns UWT into a formal research program rather than a set of analogies: the theory acquires a precise vocabulary, testable statements, and a rigorous derivation from axioms to consequences — just as in any mature physical theory.',
      ],
    },
    insight: loc(
      'Философская идея становится наукой в тот момент, когда у неё появляются аксиомы и доказательства, а не только аналогии.',
      'A philosophical idea becomes science the moment it acquires axioms and proofs, not just analogies.',
    ),
    formula: 'метафора → язык → аксиомы → теоремы',
  },
  {
    id: 10,
    eyebrow: loc('Открытые задачи', 'Open problems'),
    title: loc('Как из отношений получить физику', 'How to get physics out of relations'),
    body: {
      ru: [
        'Самая трудная часть программы — показать, что из чистых отношений действительно выводятся привычные физические величины, а не только красивые слова о них. Этому посвящена отдельная работа с решением открытых задач теории.',
        'Через последовательность R → S → Time удаётся явно построить расстояние d, скорость v, массу m как меру устойчивости отношений, импульс p, силу F, энергию E, лагранжиан L и гамильтониан H — весь стандартный арсенал механики, но выведенный, а не постулированный.',
      ],
      en: [
        'The hardest part of the program is to show that familiar physical quantities really are derived from pure relations — and not just fine words about them. A separate work on solving the theory’s open problems is devoted to exactly this.',
        'Through the sequence R → S → Time it becomes possible to explicitly construct distance d, velocity v, mass m as a measure of the stability of relations, momentum p, force F, energy E, the Lagrangian L, and the Hamiltonian H — the entire standard arsenal of mechanics, derived rather than postulated.',
      ],
    },
    insight: loc(
      'Масса, энергия и сила перестают быть первичными данностями и становятся производными от истории отношений.',
      'Mass, energy, and force cease to be primitive givens and become derivatives of the history of relations.',
    ),
    formula: 'R, S, Time ⇒ d, v, m, p, F, E, L, H',
  },
  {
    id: 11,
    eyebrow: loc('Модель', 'The model'),
    title: loc('Мини-вселенная внутри компьютера', 'A mini-universe inside a computer'),
    body: {
      ru: [
        'Чтобы проверить теорию не только на бумаге, в проекте написана вычислительная модель — пакет uwt_modeling. Она создаёт набор частей, живущих в дискретной решётке Z_N^d, и пересчитывает их отношения на каждом шаге.',
        'Дальше модель шаг за шагом извлекает из изменения отношений расстояние, скорость, массу-как-устойчивость, импульс, силу, энергию, лагранжиан, энтропию — и даже релятивную волновую функцию ψ, построенную из тех же отношений через компенсированную арифметику Balansis.',
      ],
      en: [
        'To test the theory not just on paper, the project includes a computational model — the uwt_modeling package. It creates a set of parts living on a discrete lattice Z_N^d and recomputes their relations at every step.',
        'Step by step, the model then extracts from the change of relations distance, velocity, mass-as-stability, momentum, force, energy, the Lagrangian, entropy — and even a relational wave function ψ, built out of those same relations via the compensated arithmetic of Balansis.',
      ],
    },
    insight: loc(
      'Отношения меняются — и из этого изменения, шаг за шагом, вырастает всё движение.',
      'Relations change — and out of that change, step by step, all motion grows.',
    ),
    formula: 'ΔR ⇒ Motion ⇒ m, p, F, E',
  },
  {
    id: 12,
    eyebrow: loc('Результат', 'The result'),
    title: loc('Проверяемая, а не только красивая структура', 'A testable structure, not just a beautiful one'),
    body: {
      ru: [
        'Красивая идея ничего не стоит в физике, если её нельзя опровергнуть расчётом. Поэтому модель не просто рисует картинки — она формально проверяет собственные теоретические претензии на каждом прогоне.',
        'Автоматические тесты подтверждают, что построенное расстояние действительно ведёт себя как метрика (тождество, симметрия, неравенство треугольника), что локальная скорость не превышает заданный предел, и что энтропия системы не убывает во времени — то есть стрела времени соблюдается.',
      ],
      en: [
        'In physics, a beautiful idea is worth nothing if it cannot be refuted by calculation. So the model does not merely draw pictures — it formally checks its own theoretical claims on every run.',
        'Automated tests confirm that the constructed distance really behaves like a metric (identity, symmetry, the triangle inequality), that local speed never exceeds the prescribed bound, and that the system’s entropy does not decrease over time — that is, the arrow of time is respected.',
      ],
    },
    insight: loc(
      'Теория, которая не может провалить собственную проверку, ничего не доказывает — здесь тесты проходят по-настоящему.',
      'A theory that cannot fail its own test proves nothing — here the tests genuinely pass.',
    ),
    formula: 'metric_is_valid = true · speed_bound_respected = true',
  },
  {
    id: 13,
    eyebrow: loc('Практика: сети', 'In practice: networks'),
    title: loc('Когда связи важнее объектов', 'When connections matter more than objects'),
    body: {
      ru: [
        'UWT не претендует на замену Стандартной модели или ОТО, но её язык отношений оказывается на удивление удобным инструментом там, где на первый план выходят не сами объекты, а связи между ними.',
        'Социальные графы, интернет-маршрутизация, транспортные сети, цепочки поставок, связи между устройствами — везде, где узел сам по себе малоинформативен, а важна динамика его отношений с соседями, реляционный взгляд UWT даёт естественный набор понятий: расстояние, устойчивость, центр описания.',
      ],
      en: [
        'UWT does not claim to replace the Standard Model or general relativity, but its language of relations turns out to be a surprisingly convenient tool wherever it is not the objects themselves that come to the fore, but the connections between them.',
        'Social graphs, internet routing, transport networks, supply chains, links between devices — wherever a node by itself carries little information and what matters is the dynamics of its relations with its neighbors, the relational view of UWT provides a natural set of concepts: distance, stability, a center of description.',
      ],
    },
    insight: loc(
      'Там, где объект без связей бессмысленен, реляционная физика говорит на родном языке предметной области.',
      'Where an object without connections is meaningless, relational physics speaks the domain’s native language.',
    ),
    formula: 'система = граф отношений {Aᵢ, R(Aᵢ,Aⱼ)}',
  },
  {
    id: 14,
    eyebrow: loc('Практика: устойчивость', 'In practice: stability'),
    title: loc('Масса как застывшая устойчивость', 'Mass as frozen stability'),
    body: {
      ru: [
        'Один из самых плодотворных переносов UWT в прикладные задачи — идея m(Aᵢ) = M(Stab(Aᵢ)): масса части — это мера того, насколько мало меняются её отношения с остальными частями со временем.',
        'Эта же логика без изменений переносится на команды, экономики, сети серверов и маршруты доставки: если связи элемента с окружением почти не меняются, элемент устойчив — «тяжёл» в переносном смысле; если связи лихорадочно перестраиваются, элемент «легковесен» и склонен к распаду.',
      ],
      en: [
        'One of the most fruitful transfers of UWT into applied problems is the idea m(Aᵢ) = M(Stab(Aᵢ)): the mass of a part is a measure of how little its relations with the other parts change over time.',
        'The same logic carries over unchanged to teams, economies, server networks, and delivery routes: if an element’s connections with its surroundings barely change, the element is stable — “heavy” in the figurative sense; if its connections are frantically rearranging, the element is “lightweight” and prone to falling apart.',
      ],
    },
    insight: loc(
      'Устойчивая команда и устойчивая частица описываются одной и той же математикой отношений.',
      'A stable team and a stable particle are described by one and the same mathematics of relations.',
    ),
    formula: 'm(Aᵢ) = M(Stab(Aᵢ))',
  },
  {
    id: 15,
    eyebrow: loc('Практика: прогноз', 'In practice: forecasting'),
    title: loc('Будущее прячется в истории отношений', 'The future hides in the history of relations'),
    body: {
      ru: [
        'Если сохранить историю того, как менялись отношения системы, эту историю можно экстраполировать. Модель UWT умеет строить простой прогноз наблюдаемых величин — от линейного тренда до сравнения с отложенной выборкой (holdout).',
        'На практике это открывает дорогу к прогнозированию нагрузки в сети, вероятности распада группы, момента резкого скачка в системе — везде, где сигналом служит не абсолютное значение, а темп изменения отношений во времени.',
      ],
      en: [
        'If you keep a history of how a system’s relations have changed, that history can be extrapolated. The UWT model can build a simple forecast of observable quantities — from a linear trend to comparison against a holdout sample.',
        'In practice this opens the way to forecasting network load, the probability of a group breaking apart, or the moment of a sharp jump in a system — wherever the signal is not an absolute value but the rate at which relations change over time.',
      ],
    },
    insight: loc(
      'Не нужно знать будущее целиком — достаточно точно знать, как менялись связи в прошлом.',
      'You do not need to know the whole future — it is enough to know precisely how the connections changed in the past.',
    ),
    formula: 'history(S₁, …, Sₙ) → forecast(Sₙ₊₁)',
  },
  {
    id: 16,
    eyebrow: loc('Для ребёнка', 'For a child'),
    title: loc('Объяснение на кубиках', 'An explanation with building blocks'),
    body: {
      ru: [
        'Один кубик на столе ничего не говорит о расстоянии — сравнивать не с чем. Но стоит положить рядом второй кубик, и сразу появляется «далеко» или «близко», а вместе с ним — самое первое подобие пространства.',
        'Если кубики начинают двигаться друг относительно друга, их взаимное расположение меняется — а изменение и есть то, из чего рождается время. Когда много кубиков долго держатся вместе почти без изменений, они складываются в устойчивую фигуру — прообраз массы и вещества.',
      ],
      en: [
        'A single block on the table says nothing about distance — there is nothing to compare it with. But put a second block next to it, and “far” and “near” immediately appear, and with them — the very first semblance of space.',
        'If the blocks start moving relative to each other, their mutual arrangement changes — and change is exactly what time is born from. When many blocks hold together for a long time almost without changing, they form a stable figure — a prototype of mass and matter.',
      ],
    },
    insight: loc(
      'Сравнение двух кубиков — это, в миниатюре, тот же самый акт, из которого UWT выводит целую физику.',
      'Comparing two blocks is, in miniature, the very same act from which UWT derives an entire physics.',
    ),
    formula: 'сравнение двух → рождение мира',
  },
  {
    id: 17,
    eyebrow: loc('Финал', 'Finale'),
    title: loc('Самая короткая формула теории', 'The shortest formula of the theory'),
    body: {
      ru: [
        'Всю программу UWT можно сжать до одной цепочки следствий: нет различия — нет пространства и времени. Есть различие — есть отношения. Меняются отношения — появляется время. Устойчивые отношения — рождается физика.',
        'Это не лозунг, а буквальный план построения теории от первого понятия до последней физической величины — план, реализованный в проекте и на бумаге, в виде монографии, и в коде, в виде проверяемой вычислительной модели.',
      ],
      en: [
        'The whole UWT program can be compressed into a single chain of consequences: no difference — no space and no time. There is difference — there are relations. Relations change — time appears. Relations become stable — physics is born.',
        'This is not a slogan but a literal plan for building the theory from the first concept to the last physical quantity — a plan realized in the project both on paper, as a monograph, and in code, as a testable computational model.',
      ],
    },
    insight: loc(
      'Физика — это то, что остаётся, когда отношения между частями Целого становятся достаточно устойчивыми, чтобы их можно было измерить.',
      'Physics is what remains when the relations between the parts of the Whole become stable enough to be measured.',
    ),
    formula: 'Physics = stable ΔRelations(U)',
  },
]
