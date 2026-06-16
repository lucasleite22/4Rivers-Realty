/**
 * 4Rivers Realty — API Client
 * Include in admin.html, crm.html, portal.html:
 *   <script src="/js/api-client.js"></script>
 */

(function (window) {
  'use strict'

  const API_BASE = '/api'

  // ── Core fetch helpers ──────────────────────────────────────

  async function _request(method, path, body) {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // sends httpOnly cookie
    }

    if (body !== undefined) {
      options.body = JSON.stringify(body)
    }

    let res
    try {
      res = await fetch(API_BASE + path, options)
    } catch (err) {
      console.error('[API] Network error:', err)
      throw new Error('Network error — please check your connection.')
    }

    if (res.status === 401) {
      // Redirect to login on unauthorized
      window.location.href = '/admin/login.html'
      return
    }

    if (!res.ok) {
      let message = `HTTP ${res.status}`
      try {
        const data = await res.json()
        message = data.error || message
      } catch (_) {}
      throw new Error(message)
    }

    if (res.status === 204) return null

    return res.json()
  }

  function apiGet(path) {
    return _request('GET', path, undefined)
  }

  function apiPost(path, body) {
    return _request('POST', path, body)
  }

  function apiPatch(path, body) {
    return _request('PATCH', path, body)
  }

  function apiDelete(path) {
    return _request('DELETE', path, undefined)
  }

  // ── Auth ────────────────────────────────────────────────────

  async function login(email, password) {
    return apiPost('/auth/login', { email, password })
  }

  async function logout() {
    await apiPost('/auth/logout')
    window.location.href = '/admin/login.html'
  }

  async function getCurrentUser() {
    return apiGet('/auth/me')
  }

  // ── Properties ──────────────────────────────────────────────

  /**
   * Load properties with optional filters.
   * @param {Object} filters - { type, status, county, minPrice, maxPrice, minAcreage, featured, showOnPortal, search, page, limit }
   */
  async function loadProperties(filters = {}) {
    const params = new URLSearchParams()
    for (const [key, val] of Object.entries(filters)) {
      if (val !== undefined && val !== null && val !== '') {
        params.set(key, String(val))
      }
    }
    const qs = params.toString() ? '?' + params.toString() : ''
    return apiGet('/properties' + qs)
  }

  async function loadProperty(id) {
    return apiGet(`/properties/${id}`)
  }

  async function loadFeaturedProperties() {
    return apiGet('/properties/featured')
  }

  /**
   * Create or update a property.
   * @param {Object} data - Property fields
   * @param {string|null} id - If provided, PATCH; otherwise POST
   */
  async function saveProperty(data, id = null) {
    if (id) {
      return apiPatch(`/properties/${id}`, data)
    }
    return apiPost('/properties', data)
  }

  async function deleteProperty(id) {
    return apiDelete(`/properties/${id}`)
  }

  /**
   * Upload an image for a property.
   * @param {string} propertyId
   * @param {File} file
   */
  async function uploadPropertyImage(propertyId, file) {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${API_BASE}/properties/${propertyId}/images`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })

    if (res.status === 401) {
      window.location.href = '/admin/login.html'
      return
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || `Upload failed: HTTP ${res.status}`)
    }

    return res.json()
  }

  async function deletePropertyImage(propertyId, imageId) {
    return apiDelete(`/properties/${propertyId}/images?imageId=${imageId}`)
  }

  async function reorderPropertyImages(propertyId, order) {
    return apiPatch(`/properties/${propertyId}/images/reorder`, { order })
  }

  // ── Leads ───────────────────────────────────────────────────

  /**
   * Load leads with optional filters and pagination.
   * @param {Object} filters - { status, type, origin, assignedToId, search, page, limit }
   */
  async function loadLeads(filters = {}) {
    const params = new URLSearchParams()
    for (const [key, val] of Object.entries(filters)) {
      if (val !== undefined && val !== null && val !== '') {
        params.set(key, String(val))
      }
    }
    const qs = params.toString() ? '?' + params.toString() : ''
    return apiGet('/leads' + qs)
  }

  async function loadLead(id) {
    return apiGet(`/leads/${id}`)
  }

  /**
   * Create or update a lead.
   * @param {Object} data
   * @param {string|null} id
   */
  async function saveLead(data, id = null) {
    if (id) {
      return apiPatch(`/leads/${id}`, data)
    }
    return apiPost('/leads', data)
  }

  async function deleteLead(id) {
    return apiDelete(`/leads/${id}`)
  }

  /**
   * Move a lead through the pipeline.
   * @param {string} id
   * @param {string} stage - LeadStatus enum value
   */
  async function moveLeadStage(id, stage) {
    return apiPatch(`/leads/${id}/stage`, { status: stage })
  }

  /**
   * Log an activity on a lead.
   * @param {string} leadId
   * @param {Object} data - { type, notes, activityDate? }
   */
  async function logActivity(leadId, data) {
    return apiPost(`/leads/${leadId}/activities`, data)
  }

  async function loadActivities(leadId) {
    return apiGet(`/leads/${leadId}/activities`)
  }

  // ── Dashboard ───────────────────────────────────────────────

  async function getDashboardStats() {
    return apiGet('/dashboard/stats')
  }

  // ── Public API ──────────────────────────────────────────────

  window.FourRiversAPI = {
    // Core
    apiGet,
    apiPost,
    apiPatch,
    apiDelete,

    // Auth
    login,
    logout,
    getCurrentUser,

    // Properties
    loadProperties,
    loadProperty,
    loadFeaturedProperties,
    saveProperty,
    deleteProperty,
    uploadPropertyImage,
    deletePropertyImage,
    reorderPropertyImages,

    // Leads
    loadLeads,
    loadLead,
    saveLead,
    deleteLead,
    moveLeadStage,
    logActivity,
    loadActivities,

    // Dashboard
    getDashboardStats,
  }

  console.log('[4Rivers API] Client loaded. Use window.FourRiversAPI.*')
})(window)
