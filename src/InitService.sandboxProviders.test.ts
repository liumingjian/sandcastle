import { describe, expect, it } from "vitest";
import { listSandboxProviders, getSandboxProvider } from "./InitService.js";

describe("Sandbox provider registry", () => {
  it("lists no-sandbox first, followed by the container providers", () => {
    const providers = listSandboxProviders();
    expect(providers.map((provider) => provider.name)).toEqual([
      "no-sandbox",
      "docker",
      "podman",
    ]);
  });

  it("getSandboxProvider represents no-sandbox without image capabilities", () => {
    const provider = getSandboxProvider("no-sandbox");
    expect(provider).toMatchObject({
      factoryImport: "noSandbox",
      supportsImageBuild: false,
    });
    expect(provider!.containerfileName).toBeUndefined();
    expect(provider!.cliNamespace).toBeUndefined();
  });

  it("getSandboxProvider returns docker entry", () => {
    const provider = getSandboxProvider("docker");
    expect(provider).toBeDefined();
    expect(provider!.containerfileName).toBe("Dockerfile");
    expect(provider!.cliNamespace).toBe("docker");
  });

  it("getSandboxProvider returns podman entry", () => {
    const provider = getSandboxProvider("podman");
    expect(provider).toBeDefined();
    expect(provider!.containerfileName).toBe("Containerfile");
    expect(provider!.cliNamespace).toBe("podman");
  });

  it("getSandboxProvider returns undefined for unknown provider", () => {
    expect(getSandboxProvider("nonexistent")).toBeUndefined();
  });
});
