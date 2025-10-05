import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";

export async function saveFile(filename: string, data: string, mimetype: string) {
  try {
    if (Capacitor.getPlatform() === "web") {
      // download the file
      const blob = new Blob([data], { type: mimetype });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      // save to temporary location
      const result = await Filesystem.writeFile({
        path: filename, data,
        directory: Directory.Cache
      });
      // then let the user choose the location via share
      await Share.share({
        title: "Save file", text: `Save ${filename}`,
        url: result.uri, dialogTitle: "Save file"
      });
    }
  } catch (err: any) {
    throw err;
  }
}