import { AppShell } from './app/AppShell.jsx';
import { LandingPage } from './app/LandingPage.jsx';
import { I18nProvider } from './i18n';

function App() {
  return (
    <I18nProvider>
      <LandingPage />
      <AppShell />
    </I18nProvider>
  );
}

export default App;
