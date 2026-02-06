/**
 * Contacts View
 * Stand-alone contact list. Manual entry first; Local Legacy Vault is optional.
 * Executor-first: screen works without any vault.
 */

import React, { useState, useCallback } from 'react';
import { Users, Plus, Phone, Copy, FileDown, X, Star } from 'lucide-react';
import { TitleBar } from '../common/TitleBar';
import type { ContactEntry, ContactRole } from '../../types';
import {
  getContactTypeInfo,
  getContactRoleInfo,
  CONTACT_ROLES,
  createManualContact,
} from '../../services/executorService';
import { storageService } from '../../services/storageService';

interface ContactsViewProps {
  contacts: ContactEntry[];
  onContactsChange: (contacts: ContactEntry[]) => void;
}

function getContactLabel(contact: ContactEntry): string {
  if (contact.role) return getContactRoleInfo(contact.role).label;
  return getContactTypeInfo(contact.type).label;
}

function getContactColor(contact: ContactEntry): string {
  if (contact.role) return getContactRoleInfo(contact.role).color;
  return getContactTypeInfo(contact.type).color;
}

const emptyContactForm = (): Partial<ContactEntry> => ({
  name: '',
  role: 'OTHER',
  phone: '',
  email: '',
  organization: '',
  notes: '',
  isKeyContact: false,
});

export const ContactsView: React.FC<ContactsViewProps> = ({ contacts, onContactsChange }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<Partial<ContactEntry>>(emptyContactForm());

  const saveContact = useCallback(
    async (payload: Partial<ContactEntry>) => {
      const name = (payload.name || '').trim();
      if (!name) return;
      if (editingId) {
        const updated = contacts.map((c) =>
          c.id === editingId
            ? {
                ...c,
                name,
                role: payload.role,
                phone: (payload.phone || '').trim() || undefined,
                email: (payload.email || '').trim() || undefined,
                organization: (payload.organization || '').trim() || undefined,
                notes: (payload.notes || '').trim() || undefined,
                isKeyContact: payload.isKeyContact ?? c.isKeyContact,
              }
            : c
        );
        onContactsChange(updated);
        await storageService.saveContacts(updated);
        setEditingId(null);
      } else {
        const newContact: ContactEntry = {
          ...createManualContact(),
          name,
          role: (payload.role as ContactRole) || 'OTHER',
          phone: (payload.phone || '').trim() || undefined,
          email: (payload.email || '').trim() || undefined,
          organization: (payload.organization || '').trim() || undefined,
          notes: (payload.notes || '').trim() || undefined,
          isKeyContact: payload.isKeyContact ?? false,
        };
        const updated = [...contacts, newContact];
        onContactsChange(updated);
        await storageService.saveContacts(updated);
        setShowAddForm(false);
      }
      setForm(emptyContactForm());
    },
    [contacts, editingId, onContactsChange]
  );

  const updateStatus = useCallback(
    async (contactId: string, contactStatus: ContactEntry['contactStatus']) => {
      const updated = contacts.map((c) =>
        c.id === contactId ? { ...c, contactStatus, lastContactedAt: new Date().toISOString() } : c
      );
      onContactsChange(updated);
      await storageService.saveContacts(updated);
    },
    [contacts, onContactsChange]
  );

  const toggleKeyContact = useCallback(
    async (contactId: string) => {
      const updated = contacts.map((c) =>
        c.id === contactId ? { ...c, isKeyContact: !c.isKeyContact } : c
      );
      onContactsChange(updated);
      await storageService.saveContacts(updated);
    },
    [contacts, onContactsChange]
  );

  const copyContactInfo = useCallback((contact: ContactEntry) => {
    const lines = [
      contact.name,
      contact.organization && `Organization: ${contact.organization}`,
      contact.phone && `Phone: ${contact.phone}`,
      contact.email && `Email: ${contact.email}`,
      contact.notes && `Notes: ${contact.notes}`,
    ].filter(Boolean);
    navigator.clipboard.writeText(lines.join('\n'));
  }, []);

  const deleteContact = useCallback(
    async (contactId: string) => {
      const updated = contacts.filter((c) => c.id !== contactId);
      onContactsChange(updated);
      await storageService.saveContacts(updated);
      if (editingId === contactId) setEditingId(null);
    },
    [contacts, editingId, onContactsChange]
  );

  const openEdit = (contact: ContactEntry) => {
    setForm({
      name: contact.name,
      role: contact.role ?? 'OTHER',
      phone: contact.phone ?? '',
      email: contact.email ?? '',
      organization: contact.organization ?? '',
      notes: contact.notes ?? '',
      isKeyContact: contact.isKeyContact ?? false,
    });
    setEditingId(contact.id);
  };

  const openAdd = () => {
    setForm(emptyContactForm());
    setEditingId(null);
    setShowAddForm(true);
  };

  const contactForm = (
    <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-3 max-w-md">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-primary">
          {editingId ? 'Edit contact' : 'Add a contact'}
        </h3>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setShowAddForm(false);
            setForm(emptyContactForm());
          }}
          className="p-1.5 text-slate-400 hover:text-text-primary rounded"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Name *</label>
        <input
          type="text"
          value={form.name ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Full name or organization"
          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-text-primary text-sm focus:outline-none focus:border-slate-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
        <select
          value={form.role ?? 'OTHER'}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as ContactRole }))}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-text-primary text-sm focus:outline-none focus:border-slate-500"
        >
          {CONTACT_ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Phone</label>
          <input
            type="tel"
            value={form.phone ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="Optional"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-text-primary text-sm focus:outline-none focus:border-slate-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
          <input
            type="email"
            value={form.email ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Optional"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-text-primary text-sm focus:outline-none focus:border-slate-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Organization (optional)</label>
        <input
          type="text"
          value={form.organization ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
          placeholder="e.g. bank or company name"
          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-text-primary text-sm focus:outline-none focus:border-slate-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Notes (optional)</label>
        <textarea
          value={form.notes ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Free text"
          rows={2}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-text-primary text-sm focus:outline-none focus:border-slate-500 resize-none"
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isKeyContact ?? false}
          onChange={(e) => setForm((f) => ({ ...f, isKeyContact: e.target.checked }))}
          className="rounded border-slate-600"
        />
        <span className="text-sm text-slate-300">Mark as key contact (include in Export Binder)</span>
      </label>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => saveContact(form)}
          disabled={!(form.name || '').trim()}
          className="px-4 py-2 bg-accent-gold text-vault-dark rounded-lg text-sm font-medium hover:bg-accent-gold-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {editingId ? 'Save' : 'Add contact'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => deleteContact(editingId)}
            className="px-4 py-2 text-slate-400 hover:text-red-400 text-sm"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="page-header-zone flex flex-col items-center text-center">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold text-text-primary">Contacts</h2>
          <TitleBar className="mt-1.5" />
        </div>
        <p className="text-slate-400 text-sm mt-1.5 max-w-md">
          Key contacts for notifications and estate administration.
        </p>
      </div>

      {/* Empty state: icon + short sentence, one primary CTA, secondary "Import later" */}
      {contacts.length === 0 && !showAddForm && (
        <div className="text-center py-8 max-w-sm mx-auto">
          <Users className="w-10 h-10 text-slate-500 mx-auto mb-3" aria-hidden />
          <p className="text-sm text-slate-300 mb-4">
            You can add contacts manually or connect them later from a Local Legacy Vault.
          </p>
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-gold text-vault-dark rounded-lg text-sm font-medium hover:bg-accent-gold-hover"
            >
              <Plus className="w-4 h-4" />
              Add a contact
            </button>
            <button
              type="button"
              className="text-xs text-slate-500 hover:text-slate-400"
              disabled
              title="Import from Local Legacy Vault when connected"
            >
              Import later from Local Legacy Vault
            </button>
          </div>
        </div>
      )}

      {/* Add form (when empty and user clicked Add) */}
      {contacts.length === 0 && showAddForm && (
        <div className="flex justify-center">{contactForm}</div>
      )}

      {/* When we have contacts: Add button + list */}
      {contacts.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-slate-700/60 text-slate-200 hover:bg-slate-700 border border-slate-600"
            >
              <Plus className="w-4 h-4" />
              Add a contact
            </button>
            <span className="text-xs text-slate-500">
              Import later from Local Legacy Vault when connected.
            </span>
          </div>

          {showAddForm && <div className="flex justify-start">{contactForm}</div>}

          {editingId && !showAddForm && (
            <div className="flex justify-start">
              {contactForm}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2 max-w-4xl">
            {contacts.map((contact) => {
              const isEditing = editingId === contact.id;
              const label = getContactLabel(contact);
              const color = getContactColor(contact);
              if (isEditing) return null;
              return (
                <div
                  key={contact.id}
                  className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="flex items-center justify-center w-7 h-7 rounded text-xs font-medium flex-shrink-0"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        {label.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-medium text-text-primary text-sm truncate">
                          {contact.name}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {contact.organization || label}
                        </p>
                      </div>
                      {contact.isKeyContact && (
                        <span title="Key contact" aria-hidden><Star className="w-3.5 h-3.5 text-accent-gold fill-accent-gold flex-shrink-0" /></span>
                      )}
                    </div>
                    <select
                      value={contact.contactStatus ?? 'NOT_CONTACTED'}
                      onChange={(e) =>
                        updateStatus(contact.id, e.target.value as ContactEntry['contactStatus'])
                      }
                      className="px-2 py-1 rounded text-xs font-medium border border-slate-600/50 bg-slate-800 text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-500 flex-shrink-0"
                    >
                      <option value="NOT_CONTACTED">Not contacted</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                  <div className="space-y-0.5 text-xs text-slate-400">
                    {contact.phone && <p>{contact.phone}</p>}
                    {contact.email && <p className="truncate">{contact.email}</p>}
                    {contact.website && <p className="truncate">{contact.website}</p>}
                  </div>
                  {/* Quick actions: Call, Copy info, Include in Export Binder */}
                  <div className="mt-2 pt-2 border-t border-slate-700/40 flex flex-wrap items-center gap-2">
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-text-primary"
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => copyContactInfo(contact)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-text-primary"
                    >
                      <Copy className="w-3 h-3" />
                      Copy info
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleKeyContact(contact.id)}
                      className={`inline-flex items-center gap-1 text-[11px] ${
                        contact.isKeyContact ? 'text-accent-gold' : 'text-slate-400 hover:text-text-primary'
                      }`}
                      title={contact.isKeyContact ? 'Remove from Export Binder' : 'Include in Export Binder'}
                    >
                      <FileDown className="w-3 h-3" />
                      {contact.isKeyContact ? 'In binder' : 'Include in binder'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(contact)}
                      className="ml-auto text-[11px] text-slate-500 hover:text-slate-400"
                    >
                      Edit
                    </button>
                  </div>
                  {contact.notes && (
                    <p className="mt-2 text-[11px] text-slate-500 border-t border-slate-700/40 pt-2">
                      {contact.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
