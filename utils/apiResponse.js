const apiResponse = (response, success, message, data = null, apiStatus = 200) => {
    return response.status(apiStatus).json({
        success,
        message,
        data
    });
};

export default apiResponse;
