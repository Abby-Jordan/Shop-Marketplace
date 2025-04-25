import { useMutation } from '@apollo/client';
import { RECORD_USER_ACTIVITY } from '@/graphql/mutation';

export const useRecordActivity = () => {
  const [recordActivity] = useMutation(RECORD_USER_ACTIVITY);

  const recordUserActivity = async (userId: string, type: string, details?: any) => {
    try {
      await recordActivity({
        variables: {
          userId,
          type,
          details,
        },
      });
    } catch (error) {
      console.error('Error recording user activity:', error);
    }
  };

  return recordUserActivity;
};

// Activity types
export const ActivityType = {
  LOGIN: 'LOGIN',
  BROWSE_PRODUCTS: 'BROWSE_PRODUCTS',
  VIEW_PRODUCT: 'VIEW_PRODUCT',
  ADD_TO_CART: 'ADD_TO_CART',
  PLACE_ORDER: 'PLACE_ORDER',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
} as const; 