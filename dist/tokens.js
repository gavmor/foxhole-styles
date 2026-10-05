/**
 * Foxhole design tokens — GENERATED, DO NOT EDIT.
 * Source: tokens/*.tokens.json (W3C DTCG). Rebuild with `npm run build`.
 * @gavmor/foxhole-styles v1.0.0 · style-dictionary 5.6.0
 */

/** Typewriter ribbon ink — body text, rules, masthead and table borders. */
export const fxInk = "#26221a";
/** Quiet ink — margin-box footers, captions, marginalia, page numbers. */
export const fxMuted = "#5a5245";
/** Faint hairline rule between spec-table rows. */
export const fxRule = "#8a8069";
/** Routing-block dotted leaders. */
export const fxDots = "#6b6252";
/** Table-of-contents leaders (web theme only). */
export const fxLeader = "#99907a";
/** Rubber-stamp red — DRAFT / RESTRICTED / SECRET stamps and their double border. */
export const fxStamp = "#9c1f1f";
/** Rubber-stamp green — PASSED / APPROVED clearance stamps. */
export const fxStampPass = "#1f6b34";
/** Plate base paper tone (BASE in plate/make_plate.py). */
export const fxPaperBase = "#e9dec6";
/** Plate patch tone, the blotchier second paper pass (PATCH in plate/make_plate.py). */
export const fxPaperPatch = "#e4d6ba";
/** Flat aged-paper fallback used by the web theme before the plate PNG paints over it. */
export const fxPaperFallback = "#f2ecdc";
/** Translucent paper wash behind note boxes and dispatch-slip code blocks. */
export const fxPaperWash = "rgba(255, 252, 244, 0.35)";
/** Correction-patch gradient highlight stop (0%). */
export const fxPatchLight = "#f7f3e7";
/** Correction-patch gradient mid stop (55%). */
export const fxPatchMid = "#f0ead7";
/** Correction-patch gradient shadow stop (100%). */
export const fxPatchDark = "#e8e1cb";
/** Paper-on-paper lift shadow under a stuck-on correction patch. */
export const fxPatchShadow = "rgba(74, 62, 38, 0.18)";
/** Fold crease (CREASE in plate/make_plate.py). */
export const fxCrease = "#6e5837";
/** Embossed crease highlight (HIGHLIGHT in plate/make_plate.py). */
export const fxHighlight = "#faf6ec";
/** Handling smudge (SMUDGE in plate/make_plate.py). */
export const fxSmudge = "#5f4b32";
/** Coffee-ring stain (STAIN in plate/make_plate.py). */
export const fxStain = "#785428";
/** Dark aging wash (DARK in plate/make_plate.py). */
export const fxDark = "#967850";
/** Paper-on-paper lift under a correction patch. Keep it faint — this is a slip of tape, not a UI card. */
export const fxShadowPatch = "1px 1px 2px 0px rgba(74, 62, 38, 0.18)";
/** Rubber-stamp ink opacity in the print pipeline. */
export const fxOpacityStampPrint = 0.78;
/** Rubber-stamp ink opacity in the web theme. */
export const fxOpacityStampWeb = 0.8;
/** Stamp tilt in the print pipeline. */
export const fxAngleStampPrint = -9;
/** Stamp tilt in the web theme. */
export const fxAngleStampWeb = -8;
/** Correction-patch tilt in the print pipeline. */
export const fxAnglePatchPrint = -0.7;
/** Correction-patch tilt in the web theme. */
export const fxAnglePatchWeb = -0.6;
/** Direction of the correction-patch linear gradient (light -> mid -> dark). */
export const fxAnglePatchGradient = 175;
/** Horizontal offset of the second strike that fakes bold. The web theme applies it as a text-shadow; the print pipeline doubles the glyphs in markup (diegetic-docs bin/typewriter.py), because WeasyPrint has neither faux bold nor text-shadow. */
export const fxOverstrikeOffset = "0.45px";
/** patch.light stop. */
export const fxGradientStopPatchLight = 0;
/** patch.mid stop. */
export const fxGradientStopPatchMid = 55;
/** patch.dark stop. */
export const fxGradientStopPatchDark = 100;
/** Stamp bottom padding, closing table rule. */
export const fxSpace3xs = "2px";
/** Section-heading underline gap. */
export const fxSpace2xs = "3px";
/** Table cell padding (block), stamp top padding. */
export const fxSpaceXs = "4px";
/** Table cell padding (inline), dotted-leader gutter. */
export const fxSpaceSm = "6px";
/** Note-box padding (block). */
export const fxSpaceMd = "8px";
/** Masthead padding (inline), correction-patch padding (block). */
export const fxSpaceLg = "10px";
/** Note-box padding (inline), masthead bottom padding. */
export const fxSpaceXl = "12px";
/** Masthead top padding, correction-patch outer margin, stamp padding (inline). */
export const fxSpace2xl = "14px";
/** Correction-patch padding (inline). */
export const fxSpace3xl = "16px";
/** Stamp left padding — compensates the trailing letter-spacing so the glyphs sit centred. */
export const fxSpace4xl = "20px";
/** 8.5in. */
export const fxPageWidth = "816px";
/** 11in. */
export const fxPageHeight = "1056px";
/** 0.72in. */
export const fxPageMarginTop = "69.12px";
/** 0.8in. */
export const fxPageMarginRight = "76.8px";
/** 0.75in. */
export const fxPageMarginBottom = "72px";
/** 0.8in. */
export const fxPageMarginLeft = "76.8px";
/** Single rule between spec-table rows. */
export const fxBorderHairline = "1px";
/** Note-box / dispatch-slip border. */
export const fxBorderThin = "1.5px";
/** Section-heading underline, dotted leaders, closing table rule. */
export const fxBorderRule = "2px";
/** Double rule under a table header. */
export const fxBorderDouble = "3px";
/** Stamp double border, horizontal-rule divider. */
export const fxBorderHeavy = "4px";
/** Masthead top and bottom double rules. */
export const fxBorderMasthead = "5px";
/** Body face: TT2020 Style B, a scanned 1970s typewriter face with contextual alternates ('calt' 1). No bold weight exists — emulate it with overstrike. */
export const fxFontBody = "\"TT2020\", \"Courier Prime\", monospace";
/** Display face: Special Elite, a grungy typewriter face for mastheads, h1 and stamps. */
export const fxFontDisplay = "\"Special Elite\", \"TT2020\", monospace";
/** The only weight TT2020 ships. Headings and <strong> stay at 400 and are double-struck instead. */
export const fxFontWeightRegular = 400;
/** Real bold, available only where the body face is Courier Prime (print fallback). Prefer overstrike. */
export const fxFontWeightStrong = 700;
/** Masthead h1 (22pt in print). */
export const fxFontSizeDisplay = "29.3333px";
/** Rubber-stamp lettering (21pt in print). */
export const fxFontSizeStamp = "28px";
/** Ruled section heading, h2.sec (11.5pt in print). */
export const fxFontSizeSection = "15.3333px";
/** Body copy (10.5pt in print). */
export const fxFontSizeBody = "14px";
/** Spec-table cells (9.6pt in print). */
export const fxFontSizeTable = "12.8px";
/** Page-number margin box (8pt in print). */
export const fxFontSizeFooter = "10.6667px";
/** Letterspaced form furniture in the footer margin boxes (7.5pt in print). */
export const fxFontSizeLabel = "10px";
/** h1 / masthead. */
export const fxFontScaleDisplay = 1.9;
/** h2. */
export const fxFontScaleSection = 1.25;
/** h3. */
export const fxFontScaleSubsection = 1.1;
/** h4. */
export const fxFontScaleMinor = 1;
/** Tables and dispatch-slip code blocks. */
export const fxFontScaleTable = 0.95;
/** h5 / captions. */
export const fxFontScaleCaption = 0.9;
/** Body leading in the WeasyPrint print pipeline. */
export const fxLineHeightPrint = 1.42;
/** Body leading in the Homebrewery V3 theme. */
export const fxLineHeightWeb = 1.45;
/** All heading levels. */
export const fxLineHeightHeading = 1.2;
/** Masthead h1 (2pt in print). */
export const fxTrackingMasthead = "2.6667px";
/** Masthead subtitle line (3pt in print). */
export const fxTrackingSub = "4px";
/** Ruled section heading. */
export const fxTrackingSection = "3px";
/** Footer margin-box form furniture (2pt in print). */
export const fxTrackingLabel = "2.6667px";
/** Rubber-stamp lettering. */
export const fxTrackingStamp = "7px";
/** h1 / masthead. */
export const fxTrackingScaleDisplay = 0.12;
/** h2. */
export const fxTrackingScaleSection = 0.18;
/** h3. */
export const fxTrackingScaleSubsection = 0.1;
/** h4, h5, table headers. */
export const fxTrackingScaleMinor = 0.08;
/** Rubber-stamp lettering. */
export const fxTrackingScaleStamp = 0.3;

/** Every token, keyed by its CSS custom-property name (without the leading `--`). */
export const tokens = {
  "fx-ink": fxInk,
  "fx-muted": fxMuted,
  "fx-rule": fxRule,
  "fx-dots": fxDots,
  "fx-leader": fxLeader,
  "fx-stamp": fxStamp,
  "fx-stamp-pass": fxStampPass,
  "fx-paper-base": fxPaperBase,
  "fx-paper-patch": fxPaperPatch,
  "fx-paper-fallback": fxPaperFallback,
  "fx-paper-wash": fxPaperWash,
  "fx-patch-light": fxPatchLight,
  "fx-patch-mid": fxPatchMid,
  "fx-patch-dark": fxPatchDark,
  "fx-patch-shadow": fxPatchShadow,
  "fx-crease": fxCrease,
  "fx-highlight": fxHighlight,
  "fx-smudge": fxSmudge,
  "fx-stain": fxStain,
  "fx-dark": fxDark,
  "fx-shadow-patch": fxShadowPatch,
  "fx-opacity-stamp-print": fxOpacityStampPrint,
  "fx-opacity-stamp-web": fxOpacityStampWeb,
  "fx-angle-stamp-print": fxAngleStampPrint,
  "fx-angle-stamp-web": fxAngleStampWeb,
  "fx-angle-patch-print": fxAnglePatchPrint,
  "fx-angle-patch-web": fxAnglePatchWeb,
  "fx-angle-patch-gradient": fxAnglePatchGradient,
  "fx-overstrike-offset": fxOverstrikeOffset,
  "fx-gradient-stop-patch-light": fxGradientStopPatchLight,
  "fx-gradient-stop-patch-mid": fxGradientStopPatchMid,
  "fx-gradient-stop-patch-dark": fxGradientStopPatchDark,
  "fx-space-3xs": fxSpace3xs,
  "fx-space-2xs": fxSpace2xs,
  "fx-space-xs": fxSpaceXs,
  "fx-space-sm": fxSpaceSm,
  "fx-space-md": fxSpaceMd,
  "fx-space-lg": fxSpaceLg,
  "fx-space-xl": fxSpaceXl,
  "fx-space-2xl": fxSpace2xl,
  "fx-space-3xl": fxSpace3xl,
  "fx-space-4xl": fxSpace4xl,
  "fx-page-width": fxPageWidth,
  "fx-page-height": fxPageHeight,
  "fx-page-margin-top": fxPageMarginTop,
  "fx-page-margin-right": fxPageMarginRight,
  "fx-page-margin-bottom": fxPageMarginBottom,
  "fx-page-margin-left": fxPageMarginLeft,
  "fx-border-hairline": fxBorderHairline,
  "fx-border-thin": fxBorderThin,
  "fx-border-rule": fxBorderRule,
  "fx-border-double": fxBorderDouble,
  "fx-border-heavy": fxBorderHeavy,
  "fx-border-masthead": fxBorderMasthead,
  "fx-font-body": fxFontBody,
  "fx-font-display": fxFontDisplay,
  "fx-font-weight-regular": fxFontWeightRegular,
  "fx-font-weight-strong": fxFontWeightStrong,
  "fx-font-size-display": fxFontSizeDisplay,
  "fx-font-size-stamp": fxFontSizeStamp,
  "fx-font-size-section": fxFontSizeSection,
  "fx-font-size-body": fxFontSizeBody,
  "fx-font-size-table": fxFontSizeTable,
  "fx-font-size-footer": fxFontSizeFooter,
  "fx-font-size-label": fxFontSizeLabel,
  "fx-font-scale-display": fxFontScaleDisplay,
  "fx-font-scale-section": fxFontScaleSection,
  "fx-font-scale-subsection": fxFontScaleSubsection,
  "fx-font-scale-minor": fxFontScaleMinor,
  "fx-font-scale-table": fxFontScaleTable,
  "fx-font-scale-caption": fxFontScaleCaption,
  "fx-line-height-print": fxLineHeightPrint,
  "fx-line-height-web": fxLineHeightWeb,
  "fx-line-height-heading": fxLineHeightHeading,
  "fx-tracking-masthead": fxTrackingMasthead,
  "fx-tracking-sub": fxTrackingSub,
  "fx-tracking-section": fxTrackingSection,
  "fx-tracking-label": fxTrackingLabel,
  "fx-tracking-stamp": fxTrackingStamp,
  "fx-tracking-scale-display": fxTrackingScaleDisplay,
  "fx-tracking-scale-section": fxTrackingScaleSection,
  "fx-tracking-scale-subsection": fxTrackingScaleSubsection,
  "fx-tracking-scale-minor": fxTrackingScaleMinor,
  "fx-tracking-scale-stamp": fxTrackingScaleStamp,
};

export default tokens;
