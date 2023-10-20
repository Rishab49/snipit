import { browser, expect, $ } from "@wdio/globals";
import path = require("path");
import fs = require("fs");
import { Workbench } from "wdio-vscode-service";
import { Key } from "webdriverio";
import { describe,it } from "node:test";
describe("VS Code Extension Testing", () => {
  it("should be able to load VSCode", async () => {
    const workbench = await browser.getWorkbench();
    expect(await workbench.getTitleBar().getTitle()).toContain(
      "[Extension Development Host]"
    );
  });
});

describe("opening snipit", () => {
  let workbench: Workbench;
  it("Expect one webview which has title of Snip It", async () => {
    workbench = await browser.getWorkbench();
    let dialog = await workbench.executeCommand(
      "workbench.action.files.openFile"
    );

    const input = await dialog.inputBox$.$(dialog.locators.input);
    // await input.click();
    await input.clearValue();
    await input.addValue(path.join(__dirname, "index.html"));
    await dialog.confirm();

    await workbench.getEditorView().openEditor("index.html");

    await browser
      .action("key")
      .down(Key.ArrowRight)
      .up(Key.ArrowRight)
      .perform();
    await workbench.executeCommand("snip-it.start");

    await browser.pause(2000);

    await browser.waitUntil(async () => {
      let notificaitons = await workbench.getNotifications();
      for (const n of notificaitons) {
        if ((await n.getMessage()).includes("Please select some text")) {
          n.dismiss();
          return true;
        }
      }
      return false;
    });

    await workbench.executeCommand("editor.action.selectAll");
    await workbench.executeCommand("snip-it.start");

    await browser.waitUntil(
      async () => (await workbench.getAllWebviews()).length > 0
    );

    let webviews = await workbench.getAllWebviews();
    webviews[0].open();
  });

  it("frame to have right title", async () => {
    await expect(await $("iframe[title='Snip It']")).toBeTruthy();
  });

  it("svg to have backgrund black", async () => {
    await expect(await $("svg")).toHaveStyle({
      backgroundColor: "rgba(0,0,0,1)",
    });
  });

  it("svg to have 6 childrens", async () => {
    await expect(await $("svg")).toHaveChildren(6);
  });

  it("forignTitle equal to file name", async () => {
    await expect(await (await $("svg")).$(".foreignTitle").$("p")).toHaveText(
      "index.html"
    );
  });

  it("Code element class is right", async () => {
    await expect(
      await (await $(".foreignCode")).$("code")
    ).toHaveElementClassContaining("language-html");
  });

  it("creator name element has right content and iseditable", async () => {
    await expect(await (await $(".creatorName")).$("p")).toHaveText(
      "@CreatorName"
    );
    await expect(await (await $(".creatorName")).$("p")).toHaveAttr(
      "contenteditable"
    );
  });

  it("aside have all childs", async () => {
    await expect((await $("aside")).$("form")).toHaveChildren(3);
  });

  it("color options have all child", async () => {
    await expect(await $(".color_options")).toHaveChildren(2);
  });

  it("common solid colors are generated", async () => {
    await expect(await $(".common_colors")).toHaveChildren(15);
  });

  it("common gradient are generated", async () => {
    await expect(await $(".common_gradients")).toHaveChildren(10);
  });

  it("gradient-picker to be present", async () => {
    await expect(
      await (await $(".gradient_colors")).$("gradient-picker")
    ).toBePresent();
  });

  it("color-picker to be present", async () => {
    await expect(
      await (await $(".solid_colors")).$("color-picker")
    ).toBePresent();
  });

  it("all themes are present", async () => {
    await expect(await (await $(".other_options")).$("select")).toHaveChildren(
      72
    );
  });
});

describe("check dynamic features", () => {
  it("should be able to change bg color", async () => {
    let elem = await $(".common_colors").$(".solid_color");

    await elem.click();

    await expect(await $("svg")).toHaveStyle({
      backgroundColor: "rgba(255,0,0,1)",
    });
  });

  // it("should be able to change bg color", async () => {
  //   let elem = await $(".solid_colors").$("color-picker");
  //   let rect = await browser.getElementRect(elem.elementId);
  //   let location = await elem.getLocation();

  //   await elem.click();

  //   await expect(await $("svg")).toHaveStyle({
  //     backgroundColor: "rgba(255,0,0,1)",
  //   });

  //   await browser
  //     .action("key")
  //     .down(Key.ArrowRight)
  //     .pause(5000)
  //     .up(Key.ArrowRight)
  //     .perform();

  //   await browser.pause(5000);
  // });

  it("should be able to change tabs", async () => {
    let elem = await $(".color_options").$("[data-tab='gradient_colors']");

    await elem.click();

    await expect(
      (
        await (await $(".color_options")).$(".content_container")
      ).$(".gradient_colors")
    ).toHaveElementClassContaining("active");
  });

  it("should be able to change bg gradient", async () => {
    let elem = await $(".common_gradients").$(".gradient_color");

    await elem.click();

    await expect(await $("svg")).toHaveStyle({
      backgroundImage:
        "linear-gradient(337deg, rgb(101, 78, 163), rgb(218, 152, 180))",
    });
  });

  it("should be able to adjust bg gradient", async () => {
    let elem = await (await $("gradient-picker"))
      .shadow$(".gradient-container")
      .$$(".pin");
    let rect = await browser.getElementRect(elem[1].elementId);
    await elem[1].click();

    await expect(elem[1]).toHaveElementClassContaining("active");

    await browser
      .action("pointer")
      .move({
        origin: elem[1],
      })
      .down("left")
      .move({
        x: -100,
        y: 0,
        origin: "pointer",
        duration: 5000,
      })
      .up("left")
      .perform();
  });

  it("should be able to change tabs", async () => {
    let elem = await $(".text_options").$("[data-tab='text_style_container']");

    await elem.click();

    await browser.pause(10000);

    await expect(
      (
        await (await $(".text_options")).$(".content_container")
      ).$(".text_style_container")
    ).toHaveElementClassContaining("active");
  });

  it("creator name should be invisible", async () => {
    let label = (await (await $(".text_options")).$(".content_container")).$(
      "label"
    );
    await label.click();

    await expect($(".creatorName").$("p")).toHaveStyle({
      display: "none",
    });
  });

  it("change theme", async () => {
    let select = (await $(".other_options")).$("select");

    select.selectByIndex(1);

    await expect((await $(".foreignCode")).$("code")).toHaveStyle({
      backgroundColor: "rgba(254,254,254,1)",
    });
  });
});
