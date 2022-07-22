import PlatformReflect from "./PlatformReflect.vue";
import icon from "../assets/favicon-32x32.png";
import imgUri from "@/plugins/bsdd/assets/windowIcon.svg";

export default {
  name: "ReflectPlugin", // The name of the plugin
  component: PlatformReflect,
  // addToWindows: ["3d"],
  // button: {
  //   position: "left", // Add an icon in the left or right panel. Value can be 'left' or 'right'
  //   content: "free", // How the viewer show the plugin content. Value can be 'panel', 'simple' or 'free'
  //   keepOpen: false, // If true, the window won't be closed if user click somewhere else.
  //   tooltip: "ReflectPlugin.tooltip", // Can be an i18n path or a string shown in all languages
  //   icon: {
  //     imgUri: icon,
  //   },
  // },
  window: {
    name: 'Toto',
    label: 'ReflectPlugin.window_label',
    plugins: ['fullscreen',"alerts"],
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
