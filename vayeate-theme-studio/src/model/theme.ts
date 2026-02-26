export interface ColorAssignmentValue {
  readonly value: string; // hex color
}

export interface ColorAssignment {
  readonly colorKey: string;
  readonly light: ColorAssignmentValue | null;
  readonly dark: ColorAssignmentValue | null;
  readonly useDarkForLight: boolean;
}

export type ContrastComparisonMethod = 'lessThan' | 'equalTo' | 'greaterThan';

export interface ContrastAssignmentValue {
  readonly value: number; // 1.0–10.0
  readonly comparisonMethod: ContrastComparisonMethod;
  readonly min: number | null;
  readonly max: number | null;
}

export interface ContrastAssignment {
  readonly contrastKey: string;
  readonly light: ContrastAssignmentValue | null;
  readonly dark: ContrastAssignmentValue | null;
  readonly useDarkForLight: boolean;
}

export interface Theme {
  readonly name: string;
  readonly version: string;
  readonly templateRefKey: string;
  readonly idePrimaryColorKey: string;
  readonly colorAssignments: readonly ColorAssignment[];
  readonly contrastAssignments: readonly ContrastAssignment[];
}
