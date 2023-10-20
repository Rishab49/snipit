import * as vscode from "vscode";
import { Eta } from "eta";
import { join } from "path";
import { regularTTF, semiTTF, boldTTF } from "./scripts/constant.js";
import {
  createWebviewUri,
  getFileUri,
  readFileContent,
} from "./scripts/methods.js";
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "snip-it.start",
    async () => {
      const editor = vscode.window.activeTextEditor;
      let selectedText = editor?.document.getText(editor.selection);
      // console.log(selectedText);
      if(selectedText === null || selectedText?.length === 0){
        vscode.window.showErrorMessage("Please select some text");
        return;
      }
      const panel = vscode.window.createWebviewPanel(
        "SnipIt",
        "Snip It",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(join(context.extensionPath, "public")),
          ],
        }
      );

      const script = createWebviewUri(context, panel, [
        "public",
        "scripts",
        "highlight.js",
      ]);

      const lineScript = createWebviewUri(context, panel, [
        "public",
        "scripts",
        "linenumber.js",
      ]);

      const customElementScript = createWebviewUri(context, panel, [
        "public",
        "scripts",
        "customElements.js",
      ]);

      const uploadImage = createWebviewUri(context, panel, [
        "public",
        "icons",
        "image.png",
      ]);
      let style = await readFileContent(getFileUri("codepen-embed", context));
      let fileType = editor?.document.fileName.split(".")[1];
      let fileName: string | string[] | undefined = editor?.document.fileName
        .split(".")[0]
        .split("/");
      fileName = fileName?.length ? fileName[fileName?.length - 1] : undefined;

      const eta = new Eta({
        views: join(context.extensionPath, "src", "templates"),
      });

      panel.webview.html = eta.render("./index.html", {
        style: style,
        script: script,
        lineScript: lineScript,
        customElementScript: customElementScript,
        regularTTF: regularTTF,
        semiTTF: semiTTF,
        boldTTF: boldTTF,
        fileType: fileType,
        fileName: fileName + "." + fileType,
        selectedText: "`" + selectedText + "`",
        uploadImage: uploadImage,
      });

      panel.webview.onDidReceiveMessage(async (message) => {
        switch (message.type) {
          case "change_style":
            let style = await readFileContent(
              getFileUri(message.style, context)
            );
            panel.webview.postMessage({
              type: "new_style",
              style: style,
            });
            break;
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
