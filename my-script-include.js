var ParkingFeeCalculator = Class.create();
ParkingFeeCalculator.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    calculateFee: function() {
        // Pass Parameter from Client-Script
        var carRID = this.getParameter("sysparm_car_regis_number");
        var startDateTimeString = this.getParameter("sysparm_start_time");
        var endDateTimeString = this.getParameter("sysparm_end_time");

        // Convert startDateTimeString and endDateTimeString to GlideDateTime objects
        var startDateTime = new GlideDateTime();
        startDateTime.setDisplayValue(startDateTimeString);

        var endDateTime = new GlideDateTime();
        endDateTime.setDisplayValue(endDateTimeString);

        // Query Record
        var carRecord = new GlideRecord("sc_req_item");

        // // Query SELECT carID is carRID
        // carRecord.addEncodedQuery(
        //     "active=true^cat_item.nameSTARTSWITHCar Park Reservations" + carRID
        // );
        // carRecord.query();

		// Query SELECT carID is carRID and overlaps with the given start and end time
        carRecord.addEncodedQuery(
            "active=true^cat_item.nameSTARTSWITHCar Park Reservations" + carRID +
            "^start_date_time<=javascript:gs.dateGenerate('" + endDateTimeString + "','start_date_time')^end_date_time>=javascript:gs.dateGenerate('" + startDateTimeString + "','end_date_time')"
        );
        carRecord.query();

        // Check if there are any overlapping reservations
        if (carRecord.hasNext()) {
            // There is an overlapping reservation
            gs.info("Car has another reservation at the same time");
            return false;
        }




        // Calculate duration in minutes
        var duration = GlideDateTime.subtract(startDateTime, endDateTime);
        var durationInMinutes = Math.ceil(duration.getNumericValue() / (1000 * 60)); // Convert duration to minutes

        gs.info("Duration in minutes: " + durationInMinutes);

        // Convert duration to hours and round up
        var durationInHours = Math.ceil(durationInMinutes / 60); // Convert duration to hours and round up

        gs.info("Duration in hours: " + durationInHours);

        // Calculate fee
        var fee;
        if (durationInHours < 60) {
            fee = durationInHours * 10;
        } else if (durationInHours < 240) {
            fee = durationInHours * 15;
        } else if (durationInHours < 480) {
            fee = durationInHours * 15;
        } else {
            fee = 200;
        }

        // Create a JSON object to hold the parameters
        var response = {
            durationMinutes: durationInMinutes,
            durationHours: durationInHours,
            totalFee: fee,
        };

        // Convert the JSON object to a string
        var jsonResponse = JSON.stringify(response);

        // Set the response type and send the JSON string back to the client script
        this.setResponseType(this.JSON);
        return jsonResponse;
    },

    type: "ParkingFeeCalculator",
});