const HomeConfiguration = require('../../models/home_configuration.model');
const homeConfigurationService = require('../../services/home_configuration.service');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.getHomepage = async (req, res, next) => {
    try {
        // Fetch all enabled sections sorted by displayOrder
        const sections = await HomeConfiguration.find({ enabled: true }).sort('displayOrder createdAt');

        // Resolve data for each section concurrently
        const resolvedSectionsPromises = sections.map(section => homeConfigurationService.resolveSectionData(section));
        const homepageData = await Promise.all(resolvedSectionsPromises);

        res.status(200).json(new ApiResponse(200, { sections: homepageData }, 'Homepage retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
