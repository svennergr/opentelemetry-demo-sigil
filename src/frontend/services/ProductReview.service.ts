// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import ProductReviewGateway from '../gateways/rpc/ProductReview.gateway';
import { ChatMessage } from '../protos/demo';

const ProductReviewService = () => ({

    async getProductReviews(id: string) {
        const productReviews = await ProductReviewGateway.getProductReviews(id);

        return productReviews;
    },
    async getAverageProductReviewScore(id: string) {
        const averageScore = await ProductReviewGateway.getAverageProductReviewScore(id);

        return averageScore;
    },
    async askProductAIAssistant(id: string, question: string, history: ChatMessage[]) {
        const response = await ProductReviewGateway.askProductAIAssistant(id, question, history);

        return response;
    },
});

export default ProductReviewService();
