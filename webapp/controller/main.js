sap.ui.require([
    "path/to/View11controller" // Adjust the path as per your project structure
], function (View11controller) {
    "use strict";

    return Controller.extend("grcmom.controller.View1", {
        onSubmitPress: function () {
            // Your existing code
            const response = View11controller.main_func(textValue);
            console.log("API Response:", response);
            // Remaining code
        }
    });
});
