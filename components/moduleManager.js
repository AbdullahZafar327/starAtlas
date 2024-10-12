// This code defines an object f that acts as a module registration and creation system. It's used to register types of modules, create instances of them, and manage a collection of registered module types.

import { ElementManager } from "./ElementManager";


export const ModuleManager = {
     registeredModules : [],

     // Register a new module type with a name and constructor
     register: function(moduleName,moduleClass){
         if(this.registeredModules[moduleName] && moduleClass.prototype instanceof ElementManager){
            console.log(moduleName + " must extend AbstractModule");
         }else{
            this.registeredModules[moduleName] = moduleClass
         }
     },

     //create modules if registered
     createModule: function(moduleName,...args){
        const module = this.registeredModules[moduleName]

        if(!module){
            console.error(moduleName + "is not a registered module")
            return null
        }

        return new (0, this.registeredModules[moduleName])(...args);
     },

     registerModules: function(modules){
            Object.keys(modules).forEach((module)=>{
                const moduleName = module
                this.register(moduleName,modules[moduleName])
            })
     }
}
