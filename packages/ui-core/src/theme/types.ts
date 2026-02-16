export interface PrismColorRoles {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceBright: string;
  surfaceDim: string;
  outline: string;
  outlineVariant: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
  shadow: string;
  scrim: string;
}

export interface PrismTypographyEntry {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  letterSpacing: string;
}

export interface PrismTypographySizeScale {
  large: PrismTypographyEntry;
  medium: PrismTypographyEntry;
  small: PrismTypographyEntry;
}

export interface PrismTypographyScale {
  display: PrismTypographySizeScale;
  headline: PrismTypographySizeScale;
  title: PrismTypographySizeScale;
  body: PrismTypographySizeScale;
  label: PrismTypographySizeScale;
}

export interface PrismShapeScale {
  none: string;
  extraSmall: string;
  small: string;
  medium: string;
  large: string;
  extraLarge: string;
  full: string;
}

export interface PrismElevationScale {
  level0: string;
  level1: string;
  level2: string;
  level3: string;
  level4: string;
  level5: string;
}

export interface PrismTheme {
  color: PrismColorRoles;
  typography: PrismTypographyScale;
  shape: PrismShapeScale;
  elevation: PrismElevationScale;
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type ThemeOverride = DeepPartial<PrismTheme>;
