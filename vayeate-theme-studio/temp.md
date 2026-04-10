```ts
export enum ThemeActionType {

  ThemeVariablesVariableSelectionCheckboxOnToggle = 'THEME_VARIABLES_VARIABLE_SELECTION_CHECKBOX_ON_TOGGLE',
  // ThemeVariablesColorDarkTextOnChange = 'THEME_VARIABLES_COLOR_DARK_TEXT_ON_CHANGE',
  ThemeVariablesColorDarkTextOnCommit = 'THEME_VARIABLES_COLOR_DARK_TEXT_ON_COMMIT',
  ThemeVariablesColorDarkColorButtonOnClick = 'THEME_VARIABLES_COLOR_DARK_COLOR_BUTTON_ON_CLICK',
  ThemeVariablesColorDarkColorPickerOnSelect = 'THEME_VARIABLES_COLOR_DARK_COLOR_PICKER_ON_SELECT',
  // ThemeVariablesColorDarkColorPickerOnCommit = 'THEME_VARIABLES_COLOR_DARK_COLOR_PICKER_ON_COMMIT',
  ThemeVariablesColorDarkColorEyedropperButtonOnClick = 'THEME_VARIABLES_COLOR_DARK_COLOR_EYEDROPPER_BUTTON_ON_CLICK',
  // ThemeVariablesColorLightTextOnChange = 'THEME_VARIABLES_COLOR_LIGHT_TEXT_ON_CHANGE',
  ThemeVariablesColorLightTextOnCommit = 'THEME_VARIABLES_COLOR_LIGHT_TEXT_ON_COMMIT',
  ThemeVariablesColorLightColorButtonOnClick = 'THEME_VARIABLES_COLOR_LIGHT_COLOR_BUTTON_ON_CLICK',
  ThemeVariablesColorLightColorPickerOnSelect = 'THEME_VARIABLES_COLOR_LIGHT_COLOR_PICKER_ON_SELECT',
  // ThemeVariablesColorLightColorPickerOnCommit = 'THEME_VARIABLES_COLOR_LIGHT_COLOR_PICKER_ON_COMMIT',
  ThemeVariablesColorLightColorEyedropperButtonOnClick = 'THEME_VARIABLES_COLOR_LIGHT_COLOR_EYEDROPPER_BUTTON_ON_CLICK',
  ThemeVariablesColorUseDarkForLightCheckboxOnToggle = 'THEME_VARIABLES_COLOR_USE_DARK_FOR_LIGHT_CHECKBOX_ON_TOGGLE',
  // ThemeVariablesContrastDarkValueTextOnChange = 'THEME_VARIABLES_CONTRAST_DARK_VALUE_TEXT_ON_CHANGE',
  ThemeVariablesContrastDarkValueTextOnCommit = 'THEME_VARIABLES_CONTRAST_DARK_VALUE_TEXT_ON_COMMIT',
  ThemeVariablesContrastDarkMethodListOnCommit = 'THEME_VARIABLES_CONTRAST_DARK_METHOD_LIST_ON_COMMIT',
  // ThemeVariablesContrastDarkMinTextOnChange = 'THEME_VARIABLES_CONTRAST_DARK_MIN_TEXT_ON_CHANGE',
  ThemeVariablesContrastDarkMinTextOnCommit = 'THEME_VARIABLES_CONTRAST_DARK_MIN_TEXT_ON_COMMIT',
  // ThemeVariablesContrastDarkMaxTextOnChange = 'THEME_VARIABLES_CONTRAST_DARK_MAX_TEXT_ON_CHANGE',
  ThemeVariablesContrastDarkMaxTextOnCommit = 'THEME_VARIABLES_CONTRAST_DARK_MAX_TEXT_ON_COMMIT',
  // ThemeVariablesContrastLightValueTextOnChange = 'THEME_VARIABLES_CONTRAST_LIGHT_VALUE_TEXT_ON_CHANGE',
  ThemeVariablesContrastLightValueTextOnCommit = 'THEME_VARIABLES_CONTRAST_LIGHT_VALUE_TEXT_ON_COMMIT',
  ThemeVariablesContrastLightMethodListOnCommit = 'THEME_VARIABLES_CONTRAST_LIGHT_METHOD_LIST_ON_COMMIT',
  // ThemeVariablesContrastLightMinTextOnChange = 'THEME_VARIABLES_CONTRAST_LIGHT_MIN_TEXT_ON_CHANGE',
  ThemeVariablesContrastLightMinTextOnCommit = 'THEME_VARIABLES_CONTRAST_LIGHT_MIN_TEXT_ON_COMMIT',
  // ThemeVariablesContrastLightMaxTextOnChange = 'THEME_VARIABLES_CONTRAST_LIGHT_MAX_TEXT_ON_CHANGE',
  ThemeVariablesContrastLightMaxTextOnCommit = 'THEME_VARIABLES_CONTRAST_LIGHT_MAX_TEXT_ON_COMMIT',
  ThemeVariablesLightUseDarkCheckboxOnToggle = 'THEME_VARIABLES_LIGHT_USE_DARK_CHECKBOX_ON_TOGGLE', // Rename to Contrast?

  // Maybe something here?
  ThemePreviewVariableListOnCommit = 'THEME_PREVIEW_VARIABLE_LIST_ON_COMMIT',
  ThemePreviewVariableFilterTextOnChange = 'THEME_PREVIEW_VARIABLE_FILTER_TEXT_ON_CHANGE',
  ThemePreviewVariableFilterClearOnClick = 'THEME_PREVIEW_VARIABLE_FILTER_CLEAR_ON_CLICK',
  ThemeDetailsPreviewTokenRefListOnCommit = 'THEME_DETAILS_PREVIEW_TOKEN_REF_LIST_ON_COMMIT',

  ThemePreviewSampleButtonOnClick = 'THEME_PREVIEW_SAMPLE_BUTTON_ON_CLICK',
  ThemePreviewSampleListOnCommit = 'THEME_PREVIEW_SAMPLE_LIST_ON_COMMIT',

  // Do something about this
  ThemeEyedropperOverlayCancelButtonOnClick = 'THEME_EYEDROPPER_OVERLAY_CANCEL_BUTTON_ON_CLICK',
  ThemeEyedropperOverlayColorCommitOnClick = 'THEME_EYEDROPPER_OVERLAY_COLOR_COMMIT_ON_CLICK',


  

  
  
}
```

Create cursor agent files to provide guidance for modifying the vayeate theme studio application architecture.

For the following concepts, create a rule file that defines the practices and conventsions for the concept, and a skill file for creating or modifying a new instance of the concept. The skill file should reference the rule file as it's guidance and should not duplicate details from the rule file.
- Controller
- Operation
- Validation
- ViewModel
- Component
- State
- Gateway
- Service
- Model

For the following layers, create a rule file that defines the practices and conventions for the layer.
- electron
- app
- domain
- gateway

Create a code maintainer agent that will review the codebase and identify any violations of the rules and conventions. It should generate a report of the violations and suggest fixes. It should **not** make any changes to the codebase.

Create an agent directive maintainer agent that will review the agent directive files (rules, skills, agents) and identify any changes to the application conventions or architecture that need to be updated in the directive files. It should look for redundancies, conflicts, or unnecessary details or complexity. It should generate a report of the changes and suggest updates to the directive files. It should **not** make any changes to the directive files. The user may provide a prompt to the directive maintainer that includes a specific change to make to the agent directive files. That should be considered authoritative and directives should be updated to reflect that change regardless of what the application conventions or architecture are.

Create an app architecture rule file that defines the high level application architecture and code flows.

Keep all agent directive files simple, and concise. Be efficient with agent context. Include example of good and bad practices whenever appropriate.

Use the following guidance to create the agent directive files:
---

All user-triggered mutations flow through the ActionQueue for predictable, sequential processing.
There is a clean separation between **UI actions** (events on the queue) and **app logic** (controllers and operations).
Only UI events are placed on the queue.
the **handler layer** routes each action to the correct controller, which composes fine-grained operations.

Every action type is a UI event of the form `<CONTROL>_<ACTION>`. Examples:

- `CATALOG_PAGE_ON_LOAD`
- `CATALOG_SYNC_BUTTON_ON_CLICK`
- `HUE_ADJUSTMENT_SLIDER_ON_DELTA`

Each UI interaction dispatches exactly one such event. The control name identifies the UI element (page, button, slider, etc.); the action suffix is one of the allowed actions for that control type.
Actions should not contain arguments that could be derived from app state. Only inputs that are a result of the action itself or fields used to identify the entity the action operations on.
e.g. `{ type: CatalogActionType.CatalogTokensSearchTextOnChange; value: string }` (passes the value the catalog tokens search text field changed to), `{ type: CatalogActionType.CatalogDetailsSourceRemoveButtonOnClick; sourceIndex: number }` (passes the index of the source to remove).

Each component and event should have it's own action type, action types should not be reused for different components, except for different components of the same type. e.g. `{ type: ThemeActionType.ThemeDetailsPreviewTokenRefListOnCommit; tokenRefField: ThemePreviewTokenRefField; value: TokenKey | null; }` is used by different theme preview token ref lists to set different preview token refs from the same set of token keys.
Each event should emit only a single action per interaction.
The action type is enqueued and processed by the action queue processor.
The processor delegates to the handler layer.
Each handler has an exhaustive switch on the action type and delegates to the correct controller.
The handler should only invoke a controller. It should not contain any business logic, but it may have some simple logic used to route the event to the correct controller.
Controllers compose one or more operations and validations to execute the action. Controller may use state getters to access state, but should never set state directly.
Operations are the only layer that contains business logic. They may invoke services (or other gateway abstractions), perform logic, get and set state.
Services are only used to interact with outside systems (file system, IPC, window, etc). They should not be used to perform business logic. They may contain logic for working with the system (e.g. handling error cases).
Gateway are abstractions over the services used to convert data between the system and the application. They should not be used to perform business logic. They may contain logic for working with the system (e.g. converting JSON into a model type).

State updates should **ONLY** be performed by operations.
State updates trigger re-renders in react components.

Controllers represent abstractions over actions the user can take in the application (GOOD: `CloseWindowController`, `DeleteCurrentCatalogController`). They are agnostic of any UI concepts and should not reference them in name (BAD: `HandleSaveButtonClickController`, `OnTextInputChangeController`).
Controllers should always have the suffix `Controller` in their name.
Controllers should only contain a single `run` method that performs the action.

Operations are fine grained units of work that perform a single atomic action. Operations are the only place that should interact with gateway abstractions, services, or modify app state.
Operations should only be invoked by controllers.
Operations should always have the suffix `Operation` in their name.
Operations should only contain a single `execute` method that performs the action.
The execute method should accept inputs required to perform the action, and should rarely directly read app state. When appropriate, the controller should read the state and pass it to the operation.
This keeps the operation focused on a single responsibility and enhances reusability. e.g. `DeleteCatalogOperation` could be used by both a `DeleteCurrentCatalogController` and a `DeleteSelectedCatalogController` to delete a catalog depending on different inputs.
Operations should do only one logical thing. It should be able to be meaningfully split into smaller operations that would be invoked separately.
Operations should act on a single entity. Acting on a batch of entities is allowed when the action is inherently one logical action (e.g. updating a set of tokens that are always applied together).
No operation should invoke another operation.

Validations are functions that validate an input and/or read app state and return a boolean (pass/fail). They answer “can this action proceed?” (e.g. can the window be maximized?).
No validation should call another validation.
Controllers run validations before invoking operations when appropriate.
Validations should be used by viewmodels to guard or display state and keep UI validation logic in sync with controller validation logic on the same entities.
Validations should always have the `Validate` prefix in their name and should be phrased as a question. e.g. `ValidateCanLockTemplate`
Validations should only contain a single `test` function that returns a boolean value.
Validations should never throw errors. Controllers should throw errors when validation fails when appropriate.

High level application layers:
- `electron` - Electron main process and IPC handlers.
- `app` - App UI and user interactions.
- `domain` - Business logic, domain models, and application state.
- `gateway` - Abstractions over interactions with external systems.
- `model` - Domain models for the application.

High level domains (layers are split by domain):
- `app` - App UI or scaffolding components and logic.
- `catalog` - Catalog and catalog page components and logic.
- `common` - Shared components and logic that are not specific to any domain.
- `core` - Components and logic that are not related to business logic, but are core to the operation of the application.
- `template` - Template and template page components and logic.
- `theme` - Theme and theme page components and logic.

Each app layer domain is further split into layers:
- `actions` - Action types and handlers for the domain.
- `components` - React components and pages for the domain.
- `viewmodel` - Viewmodel used to interact with state within the components of the domain.

Each domain layer domain is further split into layers:
- `controllers` - Controllers for the domain.
- `operations` - Operations for the domain.
- `validations` - Validations for the domain.
- `state` - State for the domain.
- `utils` - Utils for the domain.

There is a single app state aggregate.
Individual slices of app state are each contained in their own sub object.
App state should not directly contain any state fields.
App state should be immutable.
App state slices should only be read by controllers/operations via a state getter.
App state slices should only be updated via a state setter.
App state slices should only be read by react components via a `useContextSelector` hook.
App state slices should only be exposed via a view model.
React components should not directly define context selectors.

The election layer should not contain any business logic. It should only be used to interact with the system and IPC.
All in app election IPC interaction should be handled by a service. That service should be invoked via a gateway or operation.

All controllers, operations, validations, gateways, and services should be injected via tsyringe.
Models should use zod for validation.