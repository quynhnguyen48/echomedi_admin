import qs from "qs"
import axios from "../axios"

export const getProductCategories = (publicationState = "live") => {
  const query = qs.stringify({
    fields: [],
    populate: "*",
    pagination: {
      pageSize: 1000,
    },
    publicationState,
  })

  return axios.get(`/product-categories?${query}`)
}

export const createProductCategory = (data) => {
  const query = qs.stringify({
    populate: "*",
  })
  return axios.post(`/product-categories?${query}`, {
    data,
  })
}

export const updateProductCategory = (id, data) => {
  const query = qs.stringify({
    populate: "*",
  })
  return axios.put(`/product-categories/${id}?${query}`, {
    data,
  })
}

export const deleteProductCategory = (id) => {
  return axios.delete(`/product-categories/${id}`)
}

export const getProductBrands = (publicationState) => {
  const query = qs.stringify({
    fields: [],
    populate: "*",
    pagination: {
      pageSize: 1000,
    },
    publicationState,
  })

  return axios.get(`/brands?${query}`)
}

export const createProductBrand = (data) => {
  const query = qs.stringify({
    populate: "*",
  })
  return axios.post(`/brands?${query}`, {
    data,
  })
}

export const updateProductBrand = (id, data) => {
  const query = qs.stringify({
    populate: "*",
  })
  return axios.put(`/brands/${id}?${query}`, {
    data,
  })
}

export const deleteProductBrand = (id) => {
  return axios.delete(`/brands/${id}`)
}

export const getServiceBundleById = (id) => {
  return axios.get("/service-bundles/" + id + "?populate=*")
}

export const createServiceBundle = (data) => {
  return axios.post(`/service-bundles`, {
    data,
  })
}
export const getListConversationQueues = (pagination, filters) => {
  const query = qs.stringify({
    filters,
    pagination,
  })
  return axios.get(`/conversation-queues?sort[0]=createdAt%3Adesc&populate[user][populate]=*&populate[second_person][populate]=*&filters[second_person][id][\$null]=true&${query}`)
}

export const getListConversationQueueByUser = (userId, pagination) => {
  const query = qs.stringify({
    pagination
  })
  return axios.get(`/conversation-queues?sort[0]=createdAt%3Adesc&populate[user][populate]=*&populate[second_person][populate]=*&filters[second_person]=${userId}&${query}`)
}

export const getProductById = (id) => {
  const query = qs.stringify({
    populate: ["brand", "category", "images", "variants", "inventory_histories.variants"],
  })

  return axios.get(`/products/${id}?${query}`)
}

export const createProduct = (data) => {
  return axios.post(`/products`, {
    data,
  })
}

export const updateServiceBundle = (id, data) => {
  return axios.put(`/service-bundles/${id}`, {
    data,
  })
}

export const deleteProduct = (id) => {
  return axios.delete(`/products/${id}`)
}

export const addProductInventory = (data) => {
  return axios.post(`/product-inventory-histories`, { data })
}

export const addImportExport = (data) => {
  return axios.post(`/import-export-histories`, { data })
}

export const getImportExportHistory = (filters, pagination) => {
  const query = qs.stringify({
    filters,
    populate: "*",
    pagination,
    sort: ["createdAt:DESC"],
  })

  return axios.get(`/import-export-histories?${query}`)
}
