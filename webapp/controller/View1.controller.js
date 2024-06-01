sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/Router"
], function (Controller, MessageToast, Router) {
    "use strict";
	
    return Controller.extend("grcmom.controller.View1", {
        onResetPress: function () {
            this.byId("textarea").setValue("");
        },

        onSubmitPress: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            var textValue = this.byId("textarea").getValue();
			console.log(textValue)
            oRouter.navTo("RouteView2", {value: textValue});
        }
    });
});
