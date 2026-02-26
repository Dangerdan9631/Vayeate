import type { ColorVariableKey, ContrastValue, ContrastVariableKey, HexColor, ThemeName, TemplateName, Version } from './brands.js';

export interface TemplateReference {
  readonly name: TemplateName;
  readonly version: Version;
}

export interface ColorAssignmentValue {
  readonly value: HexColor;
}

export interface ColorAssignment {
  readonly colorRef: ColorVariableKey;
  readonly light: ColorAssignmentValue | null;
  readonly dark: ColorAssignmentValue | null;
  readonly useDarkForLight: boolean;
}

export type ContrastComparisonMethod = 'lessThan' | 'equalTo' | 'greaterThan';

export interface ContrastAssignmentValue {
  readonly value: ContrastValue; // 1.0–10.0
  readonly comparisonMethod: ContrastComparisonMethod;
  readonly min: ContrastValue | null;
  readonly max: ContrastValue | null;
}

export interface ContrastAssignment {
  readonly contrastVariableRef: ContrastVariableKey;
  readonly light: ContrastAssignmentValue | null;
  readonly dark: ContrastAssignmentValue | null;
  readonly useDarkForLight: boolean;
}

export interface Theme {
  readonly name: ThemeName;
  readonly version: Version;
  readonly templateRef: TemplateReference;
  readonly idePrimaryColorVariableRef: ColorVariableKey;
  readonly colorAssignments: readonly ColorAssignment[];
  readonly contrastAssignments: readonly ContrastAssignment[];
}
