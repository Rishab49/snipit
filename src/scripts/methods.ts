import * as vscode from "vscode";

function getFileUri(option: string, context: vscode.ExtensionContext) {
  return vscode.Uri.joinPath(
    context.extensionUri,
    `public/styles/${option}.css`
  );
}

async function readFileContent(uri: vscode.Uri) {
  // console.log("uri:", uri);
  let document = await vscode.workspace.openTextDocument(uri);
  let text = document.getText();
  // console.log("text", text);
  return text;
}

function createWebviewUri(
  context: vscode.ExtensionContext,
  panel: vscode.WebviewPanel,
  path: string[]
) {
  let uri = vscode.Uri.joinPath(context.extensionUri, ...path);
  return panel.webview.asWebviewUri(uri);
}

export { getFileUri, readFileContent, createWebviewUri };
