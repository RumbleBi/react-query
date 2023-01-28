import {
  UseMutateFunction,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import jsonpatch from 'fast-json-patch';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { useUser } from './useUser';
import { useCustomToast } from 'components/app/hooks/useCustomToast';
import { queryKeys } from 'react-query/constants';
// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    },
  );
  return data.user;
}

// TODO: update type to UseMutateFunction type
export function usePatchUser(): UseMutateFunction<
  User,
  unknown,
  User,
  unknown
> {
  const { user, updateUser } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient();

  const { mutate: patchUser } = useMutation(
    (newUserData: User) => patchUserOnServer(newUserData, user),
    {
      onMutate: async (newData: User | null) => {
        // query cancel
        queryClient.cancelQueries([queryKeys.user]);

        const prevUserData: User = queryClient.getQueryData([queryKeys.user]);
        updateUser(newData);

        // return prev userData
        return { prevUserData };
      },
      // prevUserDataContext === prevUserData {}
      onError: (error, newData, prevUserDataContext) => {
        // role back cache to saved value
        if (prevUserDataContext.prevUserData) {
          updateUser(prevUserDataContext.prevUserData);
          toast({
            title: 'Update failed',
            status: 'warning',
          });
        }
      },
      onSuccess: (userData: User | null) => {
        if (user) {
          // optimistic update, so we don't need code
          // updateUser(userData);
          toast({
            title: 'User updated!',
            status: 'success',
          });
        }
      },
      onSettled: () => {
        // invalid userQuery
        queryClient.invalidateQueries([queryKeys.user]);
      },
    },
  );

  return patchUser;
}
