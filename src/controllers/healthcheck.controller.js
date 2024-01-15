import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    const healthStatus = {
        status: 'OK',
        timestamp: new Date().toISOString(),
    };

    return res
    .status(200)
    .json(new APIResponse(200, healthStatus, "healthcheck Complete"))
})

export {
    healthcheck
}
