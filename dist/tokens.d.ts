/**
 * Foxhole design tokens — GENERATED, DO NOT EDIT.
 * Source: tokens/*.tokens.json (W3C DTCG). Rebuild with `npm run build`.
 * @gavmor/foxhole-styles v1.0.0 · style-dictionary 5.6.0
 */

/** Typewriter ribbon ink — body text, rules, masthead and table borders. */
export declare const fxInk: "#26221a";
/** Quiet ink — margin-box footers, captions, marginalia, page numbers. */
export declare const fxMuted: "#5a5245";
/** Faint hairline rule between spec-table rows. */
export declare const fxRule: "#8a8069";
/** Routing-block dotted leaders. */
export declare const fxDots: "#6b6252";
/** Table-of-contents leaders (web theme only). */
export declare const fxLeader: "#99907a";
/** Rubber-stamp red — DRAFT / RESTRICTED / SECRET stamps and their double border. */
export declare const fxStamp: "#9c1f1f";
/** Rubber-stamp green — PASSED / APPROVED clearance stamps. */
export declare const fxStampPass: "#1f6b34";
/** Plate base paper tone (BASE in plate/make_plate.py). */
export declare const fxPaperBase: "#e9dec6";
/** Plate patch tone, the blotchier second paper pass (PATCH in plate/make_plate.py). */
export declare const fxPaperPatch: "#e4d6ba";
/** Flat aged-paper fallback used by the web theme before the plate PNG paints over it. */
export declare const fxPaperFallback: "#f2ecdc";
/** Translucent paper wash behind note boxes and dispatch-slip code blocks. */
export declare const fxPaperWash: "rgba(255, 252, 244, 0.35)";
/** Correction-patch gradient highlight stop (0%). */
export declare const fxPatchLight: "#f7f3e7";
/** Correction-patch gradient mid stop (55%). */
export declare const fxPatchMid: "#f0ead7";
/** Correction-patch gradient shadow stop (100%). */
export declare const fxPatchDark: "#e8e1cb";
/** Paper-on-paper lift shadow under a stuck-on correction patch. */
export declare const fxPatchShadow: "rgba(74, 62, 38, 0.18)";
/** Fold crease (CREASE in plate/make_plate.py). */
export declare const fxCrease: "#6e5837";
/** Embossed crease highlight (HIGHLIGHT in plate/make_plate.py). */
export declare const fxHighlight: "#faf6ec";
/** Handling smudge (SMUDGE in plate/make_plate.py). */
export declare const fxSmudge: "#5f4b32";
/** Coffee-ring stain (STAIN in plate/make_plate.py). */
export declare const fxStain: "#785428";
/** Dark aging wash (DARK in plate/make_plate.py). */
export declare const fxDark: "#967850";
/** Paper-on-paper lift under a correction patch. Keep it faint — this is a slip of tape, not a UI card. */
export declare const fxShadowPatch: "1px 1px 2px 0px rgba(74, 62, 38, 0.18)";
/** Rubber-stamp ink opacity in the print pipeline. */
export declare const fxOpacityStampPrint: 0.78;
/** Rubber-stamp ink opacity in the web theme. */
export declare const fxOpacityStampWeb: 0.8;
/** Stamp tilt in the print pipeline. */
export declare const fxAngleStampPrint: -9;
/** Stamp tilt in the web theme. */
export declare const fxAngleStampWeb: -8;
/** Correction-patch tilt in the print pipeline. */
export declare const fxAnglePatchPrint: -0.7;
/** Correction-patch tilt in the web theme. */
export declare const fxAnglePatchWeb: -0.6;
/** Direction of the correction-patch linear gradient (light -> mid -> dark). */
export declare const fxAnglePatchGradient: 175;
/** Horizontal offset of the second strike that fakes bold. The web theme applies it as a text-shadow; the print pipeline doubles the glyphs in markup (diegetic-docs bin/typewriter.py), because WeasyPrint has neither faux bold nor text-shadow. */
export declare const fxOverstrikeOffset: "0.45px";
/** patch.light stop. */
export declare const fxGradientStopPatchLight: 0;
/** patch.mid stop. */
export declare const fxGradientStopPatchMid: 55;
/** patch.dark stop. */
export declare const fxGradientStopPatchDark: 100;
/** Stamp bottom padding, closing table rule. */
export declare const fxSpace3xs: "2px";
/** Section-heading underline gap. */
export declare const fxSpace2xs: "3px";
/** Table cell padding (block), stamp top padding. */
export declare const fxSpaceXs: "4px";
/** Table cell padding (inline), dotted-leader gutter. */
export declare const fxSpaceSm: "6px";
/** Note-box padding (block). */
export declare const fxSpaceMd: "8px";
/** Masthead padding (inline), correction-patch padding (block). */
export declare const fxSpaceLg: "10px";
/** Note-box padding (inline), masthead bottom padding. */
export declare const fxSpaceXl: "12px";
/** Masthead top padding, correction-patch outer margin, stamp padding (inline). */
export declare const fxSpace2xl: "14px";
/** Correction-patch padding (inline). */
export declare const fxSpace3xl: "16px";
/** Stamp left padding — compensates the trailing letter-spacing so the glyphs sit centred. */
export declare const fxSpace4xl: "20px";
/** 8.5in. */
export declare const fxPageWidth: "816px";
/** 11in. */
export declare const fxPageHeight: "1056px";
/** 0.72in. */
export declare const fxPageMarginTop: "69.12px";
/** 0.8in. */
export declare const fxPageMarginRight: "76.8px";
/** 0.75in. */
export declare const fxPageMarginBottom: "72px";
/** 0.8in. */
export declare const fxPageMarginLeft: "76.8px";
/** Single rule between spec-table rows. */
export declare const fxBorderHairline: "1px";
/** Note-box / dispatch-slip border. */
export declare const fxBorderThin: "1.5px";
/** Section-heading underline, dotted leaders, closing table rule. */
export declare const fxBorderRule: "2px";
/** Double rule under a table header. */
export declare const fxBorderDouble: "3px";
/** Stamp double border, horizontal-rule divider. */
export declare const fxBorderHeavy: "4px";
/** Masthead top and bottom double rules. */
export declare const fxBorderMasthead: "5px";
/** Body face: TT2020 Style B, a scanned 1970s typewriter face with contextual alternates ('calt' 1). No bold weight exists — emulate it with overstrike. */
export declare const fxFontBody: "\"TT2020\", \"Courier Prime\", monospace";
/** Display face: Special Elite, a grungy typewriter face for mastheads, h1 and stamps. */
export declare const fxFontDisplay: "\"Special Elite\", \"TT2020\", monospace";
/** The only weight TT2020 ships. Headings and <strong> stay at 400 and are double-struck instead. */
export declare const fxFontWeightRegular: 400;
/** Real bold, available only where the body face is Courier Prime (print fallback). Prefer overstrike. */
export declare const fxFontWeightStrong: 700;
/** Masthead h1 (22pt in print). */
export declare const fxFontSizeDisplay: "29.3333px";
/** Rubber-stamp lettering (21pt in print). */
export declare const fxFontSizeStamp: "28px";
/** Ruled section heading, h2.sec (11.5pt in print). */
export declare const fxFontSizeSection: "15.3333px";
/** Body copy (10.5pt in print). */
export declare const fxFontSizeBody: "14px";
/** Spec-table cells (9.6pt in print). */
export declare const fxFontSizeTable: "12.8px";
/** Page-number margin box (8pt in print). */
export declare const fxFontSizeFooter: "10.6667px";
/** Letterspaced form furniture in the footer margin boxes (7.5pt in print). */
export declare const fxFontSizeLabel: "10px";
/** h1 / masthead. */
export declare const fxFontScaleDisplay: 1.9;
/** h2. */
export declare const fxFontScaleSection: 1.25;
/** h3. */
export declare const fxFontScaleSubsection: 1.1;
/** h4. */
export declare const fxFontScaleMinor: 1;
/** Tables and dispatch-slip code blocks. */
export declare const fxFontScaleTable: 0.95;
/** h5 / captions. */
export declare const fxFontScaleCaption: 0.9;
/** Body leading in the WeasyPrint print pipeline. */
export declare const fxLineHeightPrint: 1.42;
/** Body leading in the Homebrewery V3 theme. */
export declare const fxLineHeightWeb: 1.45;
/** All heading levels. */
export declare const fxLineHeightHeading: 1.2;
/** Masthead h1 (2pt in print). */
export declare const fxTrackingMasthead: "2.6667px";
/** Masthead subtitle line (3pt in print). */
export declare const fxTrackingSub: "4px";
/** Ruled section heading. */
export declare const fxTrackingSection: "3px";
/** Footer margin-box form furniture (2pt in print). */
export declare const fxTrackingLabel: "2.6667px";
/** Rubber-stamp lettering. */
export declare const fxTrackingStamp: "7px";
/** h1 / masthead. */
export declare const fxTrackingScaleDisplay: 0.12;
/** h2. */
export declare const fxTrackingScaleSection: 0.18;
/** h3. */
export declare const fxTrackingScaleSubsection: 0.1;
/** h4, h5, table headers. */
export declare const fxTrackingScaleMinor: 0.08;
/** Rubber-stamp lettering. */
export declare const fxTrackingScaleStamp: 0.3;

export declare const tokens: {
  "fx-ink": typeof fxInk;
  "fx-muted": typeof fxMuted;
  "fx-rule": typeof fxRule;
  "fx-dots": typeof fxDots;
  "fx-leader": typeof fxLeader;
  "fx-stamp": typeof fxStamp;
  "fx-stamp-pass": typeof fxStampPass;
  "fx-paper-base": typeof fxPaperBase;
  "fx-paper-patch": typeof fxPaperPatch;
  "fx-paper-fallback": typeof fxPaperFallback;
  "fx-paper-wash": typeof fxPaperWash;
  "fx-patch-light": typeof fxPatchLight;
  "fx-patch-mid": typeof fxPatchMid;
  "fx-patch-dark": typeof fxPatchDark;
  "fx-patch-shadow": typeof fxPatchShadow;
  "fx-crease": typeof fxCrease;
  "fx-highlight": typeof fxHighlight;
  "fx-smudge": typeof fxSmudge;
  "fx-stain": typeof fxStain;
  "fx-dark": typeof fxDark;
  "fx-shadow-patch": typeof fxShadowPatch;
  "fx-opacity-stamp-print": typeof fxOpacityStampPrint;
  "fx-opacity-stamp-web": typeof fxOpacityStampWeb;
  "fx-angle-stamp-print": typeof fxAngleStampPrint;
  "fx-angle-stamp-web": typeof fxAngleStampWeb;
  "fx-angle-patch-print": typeof fxAnglePatchPrint;
  "fx-angle-patch-web": typeof fxAnglePatchWeb;
  "fx-angle-patch-gradient": typeof fxAnglePatchGradient;
  "fx-overstrike-offset": typeof fxOverstrikeOffset;
  "fx-gradient-stop-patch-light": typeof fxGradientStopPatchLight;
  "fx-gradient-stop-patch-mid": typeof fxGradientStopPatchMid;
  "fx-gradient-stop-patch-dark": typeof fxGradientStopPatchDark;
  "fx-space-3xs": typeof fxSpace3xs;
  "fx-space-2xs": typeof fxSpace2xs;
  "fx-space-xs": typeof fxSpaceXs;
  "fx-space-sm": typeof fxSpaceSm;
  "fx-space-md": typeof fxSpaceMd;
  "fx-space-lg": typeof fxSpaceLg;
  "fx-space-xl": typeof fxSpaceXl;
  "fx-space-2xl": typeof fxSpace2xl;
  "fx-space-3xl": typeof fxSpace3xl;
  "fx-space-4xl": typeof fxSpace4xl;
  "fx-page-width": typeof fxPageWidth;
  "fx-page-height": typeof fxPageHeight;
  "fx-page-margin-top": typeof fxPageMarginTop;
  "fx-page-margin-right": typeof fxPageMarginRight;
  "fx-page-margin-bottom": typeof fxPageMarginBottom;
  "fx-page-margin-left": typeof fxPageMarginLeft;
  "fx-border-hairline": typeof fxBorderHairline;
  "fx-border-thin": typeof fxBorderThin;
  "fx-border-rule": typeof fxBorderRule;
  "fx-border-double": typeof fxBorderDouble;
  "fx-border-heavy": typeof fxBorderHeavy;
  "fx-border-masthead": typeof fxBorderMasthead;
  "fx-font-body": typeof fxFontBody;
  "fx-font-display": typeof fxFontDisplay;
  "fx-font-weight-regular": typeof fxFontWeightRegular;
  "fx-font-weight-strong": typeof fxFontWeightStrong;
  "fx-font-size-display": typeof fxFontSizeDisplay;
  "fx-font-size-stamp": typeof fxFontSizeStamp;
  "fx-font-size-section": typeof fxFontSizeSection;
  "fx-font-size-body": typeof fxFontSizeBody;
  "fx-font-size-table": typeof fxFontSizeTable;
  "fx-font-size-footer": typeof fxFontSizeFooter;
  "fx-font-size-label": typeof fxFontSizeLabel;
  "fx-font-scale-display": typeof fxFontScaleDisplay;
  "fx-font-scale-section": typeof fxFontScaleSection;
  "fx-font-scale-subsection": typeof fxFontScaleSubsection;
  "fx-font-scale-minor": typeof fxFontScaleMinor;
  "fx-font-scale-table": typeof fxFontScaleTable;
  "fx-font-scale-caption": typeof fxFontScaleCaption;
  "fx-line-height-print": typeof fxLineHeightPrint;
  "fx-line-height-web": typeof fxLineHeightWeb;
  "fx-line-height-heading": typeof fxLineHeightHeading;
  "fx-tracking-masthead": typeof fxTrackingMasthead;
  "fx-tracking-sub": typeof fxTrackingSub;
  "fx-tracking-section": typeof fxTrackingSection;
  "fx-tracking-label": typeof fxTrackingLabel;
  "fx-tracking-stamp": typeof fxTrackingStamp;
  "fx-tracking-scale-display": typeof fxTrackingScaleDisplay;
  "fx-tracking-scale-section": typeof fxTrackingScaleSection;
  "fx-tracking-scale-subsection": typeof fxTrackingScaleSubsection;
  "fx-tracking-scale-minor": typeof fxTrackingScaleMinor;
  "fx-tracking-scale-stamp": typeof fxTrackingScaleStamp;
};

export default tokens;
