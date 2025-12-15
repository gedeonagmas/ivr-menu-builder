import { DefaultTranslationMap } from '../i18next';

export const pl = {
  header: {
    folderName: 'Nazwa folderu',
    projectSelection: {
      rename: 'Zmień nazwę',
      duplicateToDrafts: 'Duplikuj do wersji roboczych',
    },
    controls: {
      export: 'Eksportuj',
      import: 'Importuj',
      saveAsImage: 'Zapisz jako obraz',
      archive: 'Archiwizuj',
    },
  },
  palette: {
    templates: 'Szablony',
    nodesLibrary: 'Biblioteka węzłów',
    helpSupport: 'Pomoc i wsparcie',
  },
  node: {
    action: {
      label: 'Akcja',
      description: 'Reaguj na zdarzenia wyzwalające',
    },
    conditional: {
      label: 'Warunek',
      description: 'Rozgałęziaj przepływ pracy',
    },
    decision: {
      label: 'Decyzja',
      description: 'Kieruj przepływem pracy',
    },
    delay: {
      label: 'Opóźnienie',
      description: 'Wstrzymaj przepływ pracy',
    },
    notification: {
      label: 'Powiadomienie',
      description: 'Wysyłaj alerty lub powiadomienia',
    },
    trigger: {
      label: 'Wyzwalaj',
      description: 'Inicjuj przepływy pracy',
    },
    answerCall: {
      label: 'Odpowiedz na połączenie',
      description: 'Odpowiedz na przychodzące połączenie telefoniczne',
    },
    hangUpCall: {
      label: 'Rozłącz połączenie',
      description: 'Zakończ połączenie',
    },
    playAudioTTS: {
      label: 'Odtwórz audio lub TTS',
      description: 'Odtwórz plik audio lub wiadomość tekst-na-mowę',
    },
    sendSMS: {
      label: 'Wyślij SMS',
      description: 'Wyślij wiadomość SMS',
    },
    gatherInput: {
      label: 'Zbierz dane wejściowe',
      description: 'Zbierz dane wejściowe z dynamicznymi opcjami menu',
    },
    ivrMenu: {
      label: 'Menu IVR',
      description: 'Utwórz menu IVR z opcjami i miejscami docelowymi',
    },
    forwardToPhone: {
      label: 'Przekieruj na telefon',
      description: 'Przekieruj połączenie na numer telefonu ze statusami połączeń',
    },
    startCallRecording: {
      label: 'Rozpocznij nagrywanie połączenia',
      description: 'Rozpocznij nagrywanie połączenia',
    },
    stopCallRecording: {
      label: 'Zatrzymaj nagrywanie połączenia',
      description: 'Zatrzymaj nagrywanie połączenia',
    },
    voicemailRecording: {
      label: 'Nagrywanie poczty głosowej',
      description: 'Nagraj wiadomość poczty głosowej',
    },
    request: {
      label: 'Żądanie',
      description: 'Wykonaj żądanie HTTP ze statusami warunków',
    },
    conditions: {
      label: 'Warunki',
      description: 'Oceń warunki z dynamicznymi rozgałęzieniami',
    },
    executeSWML: {
      label: 'Wykonaj SWML',
      description: 'Wykonaj skrypt SWML',
    },
    setVariables: {
      label: 'Ustaw zmienne',
      description: 'Ustaw wartości zmiennych',
    },
    unsetVariables: {
      label: 'Usuń zmienne',
      description: 'Usuń zmienne',
    },
  },
  propertiesBar: {
    label: 'Właściwości',
    deleteNode: 'Usuń węzeł',
    deleteEdge: 'Usuń krawędź',
  },
  deleteConfirmation: {
    text: 'Usuwasz <b>trwale</b> {{selected}} {{parts}}. Proszę potwierdzić, aby kontynuować.',
    cancel: 'Anuluj',
    delete: 'Usuń',
    node: 'węzeł',
    nodes: 'węzły',
    edge: 'krawędź',
    edges: 'krawędzie',
    andConnected: 'i',
    selected: 'wybrany',
    selectedPlural: 'wybrane',
    deleteSelection: 'Usuń wybór?',
    dontShowMeThisAgain: 'Nie pokazuj tego ponownie',
  },
  loader: {
    text: 'Ładowanie...',
  },
  noAccess: {
    header: 'Otrzymaj pełny dostęp do produktu',
    title: 'Skontaktuj się, aby dowiedzieć się więcej',
    subtitle: 'Uzyskaj szczegółowe informacje o pełnym dostępie.',
  },
  templateSelector: {
    title: 'Wybierz szablon',
    description: 'Rozpocznij szybko z pre-zaprojektowanymi szablonami<br/>dla twojego edytora przepływów pracy',
    emptyCanvas: 'Pusta kanwa',
  },
  tooltips: {
    exportDiagram: 'Eksportuj plik',
    readOnlyMode: 'Przełącz tryb tylko do odczytu',
    layout: 'Ułóż diagram',
    open: 'Otwórz',
    close: 'Zamknij',
    palette: 'Paleta',
    propSidebar: 'Panel właściwości',
    remove: 'Usuń',
    cantRemoveOnlyOption: 'Nie możesz usunąć jedynej opcji',
    undo: 'Cofnij',
    redo: 'Ponów',
    addOption: 'Dodaj opcję',
    menu: 'Menu',
    pickTheProject: 'Wybierz projekt',
    openPalette: 'Otwórz paletę',
    closePalette: 'Zamknij paletę',
    importDiagram: 'Importuj plik',
    save: 'Zapisz',
    changeLanguage: 'Zmień język',
    simulate: 'Symuluj',
    pause: 'Wstrzymaj',
    resume: 'Wznów',
    deploy: 'Wdróż',
  },
  snackbar: {
    saveDiagramSuccess: 'Diagram został pomyślnie zapisany',
    noDiagramToLoad: 'Brak diagramu do załadowania!',
    loadDiagramError: 'Wystąpił błąd podczas ładowania diagramu',
    saveDiagramError: 'Wystąpił błąd podczas zapisywania diagramu',
    restoreDiagramSuccess: 'Lokalnie zapisane dane zostały przywrócone',
    restoreDiagramError: 'Nie można załadować lokalnie zapisanych danych',
    aiConnectionError: 'Błąd połączenia z serwerem AI',
    wrongDiagramFormat: 'Nieprawidłowy format diagramu',
  },
  decisionBranches: {
    branch: 'Rozgałęzienie #{{index}}',
    branches: 'Rozgałęzienia',
    addBranch: 'Dodaj rozgałęzienie',
    singleCondition: '1 warunek',
    manyConditions: '{{count}} warunków',
    noConditions: 'Brak warunków',
  },
  conditions: {
    title: 'Edytor Warunków',
    subtitle: 'Zdefiniuj Reguły Warunkowe',
    cancel: 'Anuluj',
    confirm: 'Potwierdź',
    totalNumber: 'łącznie: {{count}} warunków',
    totalNumber_one: 'łącznie: 1 warunek',
    dependencies: 'Zależności',
    compare: {
      or: 'lub',
      and: 'i',
      isEqual: 'jest równe',
      isNotEqual: 'nie jest równe',
      isGreaterThan: 'jest większe',
      isLessThan: 'jest mniejsze',
      isLessThanOrEqual: 'jest mniejsze lub równe',
      isGreaterThanOrEqual: 'jest większe lub równe',
      isContaining: 'zawiera',
      isNotContaining: 'nie zawiera',
    },
  },
} as const satisfies DefaultTranslationMap;
