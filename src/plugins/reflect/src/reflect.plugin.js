import PlatformReflect from "./PlatformReflect.vue";
import icon from "../assets/favicon-32x32.png";

export default {
  name: "ReflectPlugin", // The name of the plugin
  component: PlatformReflect,
  window: {
    name: "REFLECT",
    label: "ReflectPlugin.window_label",
    plugins: ["fullscreen", "alerts"],
    icon: {
      imgUri: icon,
    },
  },
  i18n: {
    en: {
      window_label: "Reflect is awesome!",
      search: "ex: .IfcWall ==> voir aide ?",
      ReflectTab: {
        tab1: "Projects",
        tab2: "Rules",
        footerLinkAPIReflect: "API REFLECT",
        footerLinkHelpReflect: "Aide",
        footerText: "",
      },
    },
    fr: {
      window_label: "Reflect est génial !",
      search: "ex: .IfcWall ==> voir aide ?",
      ReflectTab: {
        tab1: "Projects",
        tab2: "Settings",
        footerLinkAPIReflect: "API REFLECT",
        footerLinkHelpReflect: "Aide",
        footerText: "",
      },
    },
  },
};
