import { Canvas, FabricText } from "fabric";

export async function getBitmap(message: string) {
  const canvas = new Canvas(document.createElement("canvas"), {
    width: 1280,
    height: 720,
  });

  const text = new FabricText(message, {
    left: 175,
    top: 50,
    fontSize: 60,
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