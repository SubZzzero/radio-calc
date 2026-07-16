import { AppShell } from './app/AppShell.jsx';
import { I18nProvider } from './i18n';

function App() {
  return (
    <I18nProvider>
      <AppShell />
    </I18nProvider>
  );
}

export default App;
