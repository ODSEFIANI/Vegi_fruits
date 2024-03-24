const Product = require('../models/productModel.js');
const AppError = require('../utils/AppError.js');
const asyncWrapper = require('../utils/asyncWrapper');

class ProController {
    static async CreateProduct(request, response) {
        try {
            const { userId, attributes } = request.body;
            console.log(userId, attributes)

            // Assuming you have a Product model
            const product = await Product.create({
                user: userId, // Assuming userId corresponds to the owner of the product
                ...attributes
            });

            return response.status(201).json({
                status: 'success',
                data: {
                    product,
                },
            });
        } catch (error) {
            console.error('Error adding product:', error);
            return response.status(500).json({
                status: 'error',
                message: 'Error adding product',
            });
        }
    }
}

module.exports = ProController;