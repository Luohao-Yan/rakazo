# Desktop icons

The shared editable source and export notes are in
[`packages/ui-tokens/assets`](../../../packages/ui-tokens/assets/README.md).

Mac packaging requires Xcode 26 or newer. Electron builder compiles `Rakazo.icon`
into `Assets.car` for Tahoe and generates `icon.icns` for older macOS versions.
`icon-macos.png` is the matching development export with Dock margins.

`icon.png` and `icon.ico` are matching orange exports for Linux and Windows.
Refresh them with `pnpm --filter @rakazo/ui-tokens export:brand`.

Unpackaged launches use `icon-macos-dev.png` (macOS) or `icon-dev.png` (Windows and
Linux), the same icons with an amber `DEV` badge so the Dock or taskbar shows which
app is a development build.
