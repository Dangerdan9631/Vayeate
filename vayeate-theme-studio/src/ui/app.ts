import './styles.css';
import { TAB_DEFINITIONS, type TabId } from './tabs';

export function mountApp(container: HTMLElement): void {
  let activeTab: TabId = 'catalogs';

  const shell = document.createElement('div');
  shell.className = 'app-shell';

  const menuBar = document.createElement('header');
  menuBar.className = 'menu-bar';

  const menuTitle = document.createElement('div');
  menuTitle.className = 'menu-title';
  menuTitle.textContent = 'Vayeate Theme Studio';

  const menuLinks = document.createElement('nav');
  menuLinks.className = 'menu-links';
  menuLinks.innerHTML = '<span>File</span><span>Edit</span><span>View</span>';

  menuBar.append(menuTitle, menuLinks);

  const layout = document.createElement('div');
  layout.className = 'layout';

  const ribbon = document.createElement('aside');
  ribbon.className = 'ribbon';

  const content = document.createElement('main');
  content.className = 'content';

  const renderContent = () => {
    const selectedTab = TAB_DEFINITIONS.find((tab) => tab.id === activeTab);
    content.innerHTML = '';

    const placeholder = document.createElement('section');
    placeholder.className = 'placeholder';

    const heading = document.createElement('h1');
    heading.textContent = selectedTab?.label ?? 'Catalogs';

    placeholder.append(heading);
    content.append(placeholder);
  };

  TAB_DEFINITIONS.forEach((tab) => {
    const tabButton = document.createElement('button');
    tabButton.type = 'button';
    tabButton.className = 'ribbon-tab';
    tabButton.dataset.tabId = tab.id;
    tabButton.title = tab.label;
    tabButton.setAttribute('aria-label', tab.label);
    tabButton.setAttribute('aria-pressed', String(tab.id === activeTab));

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined ribbon-icon';
    icon.textContent = tab.iconName;
    tabButton.append(icon);

    tabButton.addEventListener('click', () => {
      activeTab = tab.id;
      ribbon.querySelectorAll<HTMLButtonElement>('.ribbon-tab').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.tabId === tab.id));
      });
      renderContent();
    });

    ribbon.append(tabButton);
  });

  layout.append(ribbon, content);
  shell.append(menuBar, layout);
  container.replaceChildren(shell);

  renderContent();
}
