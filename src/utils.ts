import KJUR from "jsrsasign";
import { Canvas, FabricText, Rect, Gradient } from "fabric";

// You should sign your JWT with a backend service in a production use-case
export function generateSignature(sessionName: string, role: number, sdkKey: string, sdkSecret: string) {
  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + 60 * 60 * 2;
  const oHeader = { alg: "HS256", typ: "JWT" };

  const oPayload = {
    app_key: sdkKey,
    tpc: sessionName,
    role_type: role,
    version: 1,
    iat: iat,
    exp: exp,
  };

  const sHeader = JSON.stringify(oHeader);
  const sPayload = JSON.stringify(oPayload);
  const sdkJWT = KJUR.KJUR.jws.JWS.sign("HS256", sHeader, sPayload, sdkSecret);
  return sdkJWT;
}

export async function getBitmap(message: string) {
  const canvas = new Canvas(document.createElement("canvas"), {
    width: 1280,
    height: 720,
  });

  const text = new FabricText(message, {
    left: 10,
    top: 10,
    fontSize: 60,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fill: "red",
  });

  canvas.add(text);
  canvas.renderAll();

  const dataUrl = canvas.toDataURL();
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const imageBitmap = await createImageBitmap(blob);
  return imageBitmap;
}

export type BusinessCardOptions = {
  name: string;
  title: string;
  company: string;
  email?: string;
  frameWidth?: number;
  frameHeight?: number;
  cardWidth?: number;
  cardHeight?: number;
  margin?: number;
  brandColor?: string;
  backgroundColor?: string; // card bg
  textColor?: string;
};

export async function getBusinessCardBitmap(options: BusinessCardOptions) {
  const {
    name,
    title,
    company,
    email,
    frameWidth = 1280,
    frameHeight = 720,
    cardWidth = 1280,
    cardHeight = 280,
    brandColor = "#3b82f6",
    textColor = "#ffffff",
  } = options;

  // Transparent full-frame canvas so the processor can scale it and keep placement consistent
  const canvasElement = document.createElement("canvas");
  const fabricCanvas = new Canvas(canvasElement, { width: frameWidth, height: frameHeight });

  const cardLeft = 0;
  const cardTop = frameHeight - cardHeight;

  const cornerRadius = 0;

  // Create a beautiful gradient background with transparency
  const gradient = new Gradient({
    type: 'linear',
    coords: {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: cardHeight,
    },
    colorStops: [
      { offset: 0, color: 'rgba(0, 71, 186, 0)' },
      { offset: 0.3, color: 'rgba(0, 71, 186, 0.6)' },
      { offset: 1, color: 'rgb(0, 37, 122)' },
    ]
  });

  const cardBackground = new Rect({
    left: cardLeft,
    top: cardTop,
    width: cardWidth,
    height: cardHeight,
    rx: cornerRadius,
    ry: cornerRadius,
    fill: gradient,
    selectable: false,
    evented: false,
    strokeWidth: 1,
  });
  fabricCanvas.add(cardBackground);

  const innerPadding = 50;
  const lineGap = 10;

  let cursorY = cardTop + innerPadding + 12;

  const nameText = new FabricText(name, {
    left: cardLeft + innerPadding,
    top: cursorY,
    fontSize: 32,
    fontWeight: 700,
    fill: textColor,
    fontFamily: 'Helvetica, Arial, sans-serif',
  });
  fabricCanvas.add(nameText);
  cursorY = (nameText.top || cursorY) + (nameText.height || 0) + lineGap;

  const titleText = new FabricText(title, {
    left: cardLeft + innerPadding,
    top: cursorY,
    fontSize: 28,
    fill: textColor,
    fontFamily: 'Helvetica, Arial, sans-serif',
    opacity: 0.9,
  });
  fabricCanvas.add(titleText);
  cursorY = (titleText.top || cursorY) + (titleText.height || 0) + lineGap;

  const companyText = new FabricText(company, {
    left: cardLeft + innerPadding,
    top: cursorY,
    fontSize: 28,
    fontWeight: 600,
    fill: brandColor,
    fontFamily: 'Helvetica, Arial, sans-serif',
  });
  fabricCanvas.add(companyText);
  cursorY = (companyText.top || cursorY) + (companyText.height || 0) + lineGap * 2;

  if (email) {
    const emailText = new FabricText(email, {
      left: cardLeft + innerPadding,
      top: cursorY,
      fontSize: 22,
      fill: textColor,
      fontFamily: 'Helvetica, Arial, sans-serif',
      opacity: 0.85,
    });
    fabricCanvas.add(emailText);
    cursorY = (emailText.top || cursorY) + (emailText.height || 0) + lineGap;
  }

  fabricCanvas.renderAll();

  const dataUrl = fabricCanvas.toDataURL({ format: "png", multiplier: 1 });
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  return bitmap;
}
