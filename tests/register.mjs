import {registerHooks} from "node:module";
registerHooks({resolve(specifier, context, next){
 if(specifier.startsWith("@/")) specifier=new URL("../src/"+specifier.slice(2), import.meta.url).href;
 if((specifier.startsWith(".")||specifier.startsWith("file:"))&&!/\.[cm]?[jt]sx?$/.test(specifier)) {
  try { return next(specifier+".ts",context); } catch {}
 }
 return next(specifier,context);
}});
