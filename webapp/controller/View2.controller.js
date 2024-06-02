sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/Router"
], function (Controller, Router) {
    "use strict";
    return Controller.extend("grcmom.controller.View2", {
        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteView2").attachPatternMatched(this._onObjectMatched, this);
            console.log(oRouter)
        },

        _onObjectMatched: function (oEvent) {
            var oParameters = oEvent.getParameter("arguments"); // Retrieve all parameters
            var text1s = sessionStorage.getItem("view1");
                 console.log("Value received in View2:", text1s);
            var sValue = oParameters.value; // Retrieve the specific parameter value
            console.log(sValue)
            
            // Ensure that the ID matches the ID of the UI element in your XML view
            this.byId("label1").setText(sText); // Adjusted ID according to the XML view
        }
    });
});
