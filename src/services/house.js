import { request } from 'umi';


export async function getHouseList(params, options) {
    return request('/api/house', {
      method: 'GET',
      params: { ...params },
      ...(options || {}),
    });
}

export async function deleteHouse(id) {
    return request(`/api/house/${id}`, {
        method: 'DELETE'
    })
}