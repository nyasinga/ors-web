import { cn } from "../../lib/cn";
import { pageContainer } from "../../lib/pageContainer";

/**
 * Shared Tailwind class bundles for the registration flow.
 * Values are ported 1:1 from the former src/styles/registration.css (+ the
 * registration rules in responsive-shared.css). Breakpoints:
 *   max-[1100px] / max-[900px] / max-[760px] / max-[640px] / min-[1600px]
 * Palette (kept as literal hex so output is identical to the old CSS):
 *   blue #075fe5 · green #078047 · red #ed1c24 · ink #101b39 · line #dbe5f0 · title #10216d
 */

/** Page root (was .register-page) */
export const registerPage = "text-[#101b39] bg-white";

/** Gutter wrapper (shared public content width) */
export const container = pageContainer;

export const main = "pt-1 pb-[18px] max-[760px]:pt-[3px] max-[760px]:pb-3";

/* ── Layout grids ── */
export const layout = cn(
  "grid grid-cols-[minmax(0,1fr)_330px] gap-5 items-start",
  "max-[1100px]:grid-cols-[1fr] max-[760px]:block",
);
export const payLayout = cn(
  "grid grid-cols-[1fr_330px] gap-5 items-start",
  "max-[1100px]:grid-cols-[1fr] max-[760px]:block",
);
export const confirmLayout = cn(
  "grid grid-cols-[minmax(0,1fr)_320px] gap-4 items-start",
  "max-[1100px]:grid-cols-[1fr] max-[760px]:block",
);

/* ── Cards / sections ── */
export const card = "border border-[#dbe5f0] rounded-lg bg-white";
export const section = "px-5 py-[17px] max-[760px]:p-[13px]";
export const sectionTitle =
  "mb-[6px] text-[27px] text-[#10216d] tracking-[-1px] font-black max-[760px]:text-[23px]";
export const subtitle =
  "mb-4 text-[#60708b] text-[14px] max-[760px]:text-[11px] max-[760px]:mb-[11px]";

/* ── Buttons / actions ── */
export const actions = "flex justify-between gap-[15px] mt-[15px] flex-wrap max-[760px]:mt-[10px]";
const btnBase = cn(
  "h-[47px] px-[30px] rounded-md border border-[#075fe5] font-bold",
  "inline-flex items-center justify-center gap-2 cursor-pointer no-underline text-[14px]",
  "max-[760px]:h-[43px] max-[760px]:px-4 max-[760px]:text-[11px]",
);
export const btn = cn(btnBase, "bg-white text-[#075fe5]");
export const btnPrimary = cn(
  btnBase,
  "bg-[#075fe5] text-white min-w-[260px] max-[760px]:min-w-0 max-[760px]:flex-1",
);
export const arrow = "text-[23px] font-normal leading-none";

/* ── Sidebar + info boxes ── */
export const sidebar = cn(
  "flex flex-col gap-[10px]",
  "max-[1100px]:grid max-[1100px]:grid-cols-[1fr_1fr]",
  "max-[900px]:grid-cols-[1fr]",
  "max-[760px]:flex max-[760px]:mt-3",
);
export const infoBox = cn(
  "p-4 rounded-lg border border-[#e4edf6] bg-[linear-gradient(140deg,#eff7ff,#f9fcff)]",
  "max-[760px]:p-3",
);
export const infoTitle =
  "flex gap-[11px] items-center text-[#1034a0] font-extrabold text-[15px] mb-[10px] max-[760px]:text-[12px]";
export const infoIcon =
  "w-[31px] h-[31px] rounded-full bg-[#075fe5] text-white grid place-items-center font-extrabold shrink-0";
export const infoText = "text-[12px] leading-[1.45] text-[#596985] m-0 max-[760px]:text-[10px]";

/* ── Form ── */
export const formCard = cn(card, "p-4");
export const formTitle =
  "flex gap-[10px] items-center font-extrabold text-[#10216d] text-[15px] mb-3";
export const formDot =
  "w-7 h-7 rounded-full bg-[#075fe5] text-white grid place-items-center shrink-0";
export const formGrid = cn(
  "grid grid-cols-[1fr_1fr] gap-x-[26px] gap-y-3",
  "max-[760px]:grid-cols-[1fr] max-[760px]:gap-[10px]",
);
export const fieldLabel =
  "block text-[12px] font-semibold mb-[5px] text-[#10216d] max-[760px]:text-[10px]";
export const required = "text-[#ed1c24]";
export const fieldControl = cn(
  "h-9 w-full border border-[#ccd9e8] rounded-[4px] px-[11px] text-[#687894] bg-white text-[12px]",
  "max-[760px]:h-[35px] max-[760px]:text-[11px]",
);
export const fieldError = "block mt-1 text-[11px] text-[#ed1c24]";
export const phone = "grid grid-cols-[105px_1fr] gap-[5px]";
export const optional = "mt-3 p-3 border border-[#dbe5f0] rounded-lg";
export const optionalGrid = cn(
  "grid grid-cols-[1fr_1fr] gap-6",
  "max-[760px]:grid-cols-[1fr] max-[760px]:gap-[10px]",
);

/* ── Price boxes ── */
export const sidePrice = "p-[15px] bg-[#effbf5] border border-[#c6ead7] rounded-lg";
export const priceLabel = "text-[12px] font-bold";
export const price = "text-[27px] font-black text-[#12652e] mt-[6px]";
export const priceSub = "text-[12px] text-[#64728a]";
export const period = "text-[11px] text-[#08713f] mt-[3px]";
export const late =
  "mt-2 p-[10px] border border-[#dbe7f4] rounded-[7px] bg-[#f4f8ff] text-[12px] text-[#101b39]";

/* ── Payment ── */
export const payTop = "grid grid-cols-[1.1fr_0.9fr] gap-[10px] max-[760px]:grid-cols-[1fr]";
export const payHeading = "text-[15px] text-[#10216d] mt-[14px] mb-2 font-extrabold";
export const paymentMethod = cn(
  "border-[1.5px] border-[#075fe5] p-[18px] rounded-lg bg-[#f5f9ff]",
  "grid grid-cols-[36px_200px_1fr] items-center gap-[14px]",
  "max-[760px]:grid-cols-[25px_130px_1fr] max-[760px]:p-3 max-[760px]:gap-2",
);
export const radioBlue = "w-5 h-5 rounded-full border-[6px] border-[#075fe5] box-border";
export const ecitizen = "w-[190px] max-w-full h-auto block max-[760px]:w-[125px]";
export const paymentMethodTitle = "text-[14px] text-[#10216d] max-[760px]:text-[11px]";
export const paymentMethodText = "mt-1 text-[12px] text-[#65728b] max-[760px]:text-[9px]";
export const notice = "mt-3 p-[14px] rounded-lg bg-[#eef7ff] text-[#4f6280] text-[12px] leading-[1.5]";
export const noticeStrong = "text-[#10216d]";
export const summary = "p-[17px] bg-[#f4f9ff] border border-[#e2ebf5] rounded-lg max-[760px]:mt-[10px]";
export const summaryTitle = "mb-[13px] text-[#10216d] text-[15px] font-extrabold";
export const summaryRow = (total = false) =>
  cn(
    "flex justify-between py-[9px] gap-[10px]",
    total
      ? "text-[14px] font-extrabold text-[#10216d]"
      : "text-[12px] border-b border-[#d9e3ef]",
  );
export const summaryTotalAmount = "text-[24px] text-[#12652e]";

/* ── Confirmation ── */
export const success = cn(card, "p-4 text-center");
export const successMark =
  "w-[54px] h-[54px] rounded-full bg-[#078047] text-white text-[30px] grid place-items-center mx-auto mb-2";
export const successTitle = "text-[21px] text-[#10216d] mb-[5px] font-black";
export const successText = "text-[11px] text-[#66748c] mx-auto mb-[15px] max-w-[560px]";
export const detailColumns = "grid grid-cols-[1fr_1fr] gap-3 text-left max-[760px]:grid-cols-[1fr]";
export const detailBox = "p-[11px] border border-[#e1e8f1] rounded-[7px]";
export const detailTitle = "mb-2 text-[#10216d] text-[11px]";
export const drow = "grid grid-cols-[24px_1fr] gap-[6px] my-[7px] text-[10px] text-[#5b6982]";
export const drowLabel = "block text-[10px] text-[#10216d]";
export const confirmActions = "flex gap-[7px] mt-3 flex-wrap";
export const smallBtn = cn(
  "flex-1 min-w-[140px] h-[34px] rounded-[4px] bg-[#074dbb] text-white text-[10px] font-bold",
  "cursor-pointer max-[760px]:min-w-[45%]",
);
export const smallBtnLink = cn(smallBtn, "inline-flex items-center justify-center no-underline");
export const pass = "p-[15px] bg-[#f7fbff] border border-[#e1e9f3] rounded-lg";
export const passTitle = "text-[#10216d] text-[14px] mb-[5px] font-extrabold";
export const passText = "text-[10px] text-[#62708a] leading-[1.4] mb-2";
export const qr = "w-[90px] h-[90px] object-cover my-[7px] mx-auto block";
export const passId = "text-center text-[10px] font-bold text-[#10216d]";
export const next = "p-[14px] bg-[#f4f9ff] border border-[#e2eaf4] rounded-lg mt-[10px]";
export const nextTitle = "text-[14px] text-[#10216d] mb-[9px] font-extrabold";
export const nextRow = "flex gap-2 my-[9px]";
export const nextIcon =
  "w-[25px] h-[25px] rounded-full bg-[#e4efff] grid place-items-center text-[#0a5fe0] text-[12px] shrink-0";
export const nextRowTitle = "block text-[10px] text-[#10216d]";
export const nextRowText = "text-[9px] text-[#62708a] mt-[2px]";
export const helpful = cn(
  card,
  "mt-3 px-[15px] py-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px]",
);
export const helpfulLabel = "text-[#10216d] text-[13px]";
export const helpfulLink = "text-[#075fe5] text-[11px] font-semibold";
