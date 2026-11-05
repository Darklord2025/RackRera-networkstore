import { invoicePageRanges } from "./invoice-pagination";

const PAGE_WIDTH_MM = 190;
const PAGE_HEIGHT_MM = 277;

async function snapshotInvoice(element: HTMLElement) {
  await document.fonts.ready;
  const host = document.createElement("div");
  host.className = "invoice-export-host";
  host.setAttribute("aria-hidden", "true");
  const clone = element.cloneNode(true) as HTMLElement;
  clone.removeAttribute("id");
  host.appendChild(clone);
  document.body.appendChild(host);
  try {
    const { default: html2canvas } = await import("html2canvas");
    const box = clone.getBoundingClientRect();
    const blocks = Array.from(
      clone.querySelectorAll<HTMLElement>(
        ".invoice-line, .invoice-heading, .invoice-parties, .invoice-metadata, .invoice-bottom, .invoice-footer",
      ),
    ).map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        start: rect.top - box.top,
        end: node.classList.contains("invoice-footer")
          ? box.height
          : rect.bottom - box.top,
      };
    });
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: document.documentElement.clientWidth,
      scrollX: 0,
      scrollY: 0,
    });
    const ratio = canvas.width / box.width;
    const ranges = invoicePageRanges(
      canvas.height,
      Math.floor((canvas.width * PAGE_HEIGHT_MM) / PAGE_WIDTH_MM),
      blocks.map((b) => ({ start: b.start * ratio, end: b.end * ratio })),
    );
    return { canvas, ranges };
  } finally {
    host.remove();
  }
}

function pageCanvas(canvas: HTMLCanvasElement, start: number, end: number) {
  const page = document.createElement("canvas");
  page.width = canvas.width;
  page.height = end - start;
  const context = page.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.drawImage(
    canvas,
    0,
    start,
    canvas.width,
    page.height,
    0,
    0,
    page.width,
    page.height,
  );
  return page;
}

export async function buildInvoicePdf(element: HTMLElement) {
  const { canvas, ranges } = await snapshotInvoice(element);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  ranges.forEach(({ start, end }, index) => {
    if (index) pdf.addPage();
    const page = pageCanvas(canvas, start, end);
    pdf.addImage(
      page.toDataURL("image/png"),
      "PNG",
      10,
      10,
      PAGE_WIDTH_MM,
      (page.height * PAGE_WIDTH_MM) / canvas.width,
      undefined,
      "FAST",
    );
  });
  return pdf;
}

export async function downloadInvoice(element: HTMLElement, filename: string) {
  const pdf = await buildInvoicePdf(element);
  pdf.save(filename.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-") + ".pdf");
}

export async function printInvoice(element: HTMLElement) {
  const { canvas, ranges } = await snapshotInvoice(element);
  const frame = document.createElement("iframe");
  frame.className = "invoice-print-frame";
  frame.title = "Invoice print";
  document.body.appendChild(frame);
  let cleanupTimer: ReturnType<typeof setTimeout> | undefined;
  const cleanup = () => {
    clearTimeout(cleanupTimer);
    frame.remove();
  };
  try {
    const doc = frame.contentDocument;
    const win = frame.contentWindow;
    if (!doc || !win) throw new Error("Print unavailable");
    const style = doc.createElement("style");
    style.textContent =
      "@page{size:A4;margin:10mm}html,body{margin:0;background:white}.invoice-print-page{width:190mm;height:277mm;break-after:page;page-break-after:always}.invoice-print-page:last-child{break-after:auto;page-break-after:auto}img{display:block;width:190mm;height:auto}";
    doc.head.appendChild(style);
    const images = ranges.map(({ start, end }, index) => {
      const page = doc.createElement("div");
      page.className = "invoice-print-page";
      const image = doc.createElement("img");
      image.alt = "Invoice page " + (index + 1);
      image.src = pageCanvas(canvas, start, end).toDataURL("image/png");
      page.appendChild(image);
      doc.body.appendChild(page);
      return image;
    });
    await Promise.all(images.map((image) => image.decode()));
    win.addEventListener("afterprint", cleanup, { once: true });
    cleanupTimer = setTimeout(cleanup, 120000);
    win.focus();
    win.print();
  } catch (error) {
    cleanup();
    throw error;
  }
}
