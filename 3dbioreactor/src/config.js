// All dimensions in meters. Y=0 is the floor (bottom of base disc).
export const GLASS_HEIGHT = 0.30;
export const GLASS_RADIUS = 0.088;        // outer radius
export const GLASS_BOTTOM_Y = 0.02;       // lowest point of glass dome
export const GLASS_TOP_Y = 0.32;
export const BASE_RADIUS = 0.115;
export const BASE_HEIGHT = 0.012;
export const ROD_COUNT = 6;
export const ROD_RADIUS = 0.004;
export const ROD_CIRCLE_RADIUS = 0.105;
export const HEADPLATE_RADIUS = 0.125;
export const HEADPLATE_THICKNESS = 0.008;
export const HEADPLATE_LOWER_Y = 0.328;   // center of lower flange disc
export const HEADPLATE_UPPER_Y = 0.348;   // center of upper plate disc
export const HEADPLATE_TOP_Y = 0.352;     // top surface — ports sit here
export const LIQUID_RADIUS = 0.080;
export const LIQUID_BASE_Y = 0.025;
export const LIQUID_MAX_HEIGHT = 0.28;
export const SHAFT_RADIUS = 0.005;
export const IMPELLER_RADIUS = 0.038;
export const IMPELLER_LOWER_Y = 0.075;
export const IMPELLER_UPPER_Y = 0.19;
export const PROBE_ROD_COUNT = 4;
export const PROBE_ROD_RADIUS = 0.0035;
export const PROBE_CIRCLE_RADIUS = 0.05;
export const BUBBLE_MAX = 300;
export const BUBBLE_REGION_RADIUS = 0.07;
export const TARGET_Y = 0.19;             // orbit target (mid-height)

export const STEEL = { color: '#d8d8dc', metalness: 1.0, roughness: 0.15, envMapIntensity: 1.2 };
export const STEEL_KNURLED = { color: '#c8c8cc', metalness: 1.0, roughness: 0.45, envMapIntensity: 1.0 };
export const STEEL_DARK = { color: '#9a9aa0', metalness: 1.0, roughness: 0.3, envMapIntensity: 1.0 };

// Culture growth: logistic curve (lag -> exponential -> stationary phase).
// biomass(t) = 1 / (1 + exp(-GROWTH_K * (t - GROWTH_T_MID))), t in seconds.
export const GROWTH_T_MID = 75;   // seconds at which growth is steepest (~half-max biomass)
export const GROWTH_K = 0.07;     // steepness of the exponential phase
export const BIOMASS_MAX = 260;
export const BIOMASS_REGION_RADIUS = 0.076;

export const LIQUID_COLOR_FRESH = '#c68a2e';
export const LIQUID_COLOR_TURBID = '#8a6a3a';
export const LIQUID_ROUGHNESS_FRESH = 0.2;
export const LIQUID_ROUGHNESS_TURBID = 0.6;
