/**
 * Contacts App
 *
 * Address book application for zOS with contact management.
 * Black glass UI with macOS dark mode aesthetics.
 */

import React, { useState, useMemo } from 'react';
import { ZWindow } from '@z-os/ui';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Building,
  Tag,
  User,
  Download,
  Upload,
  Star,
  X,
  Check,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface ContactsWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  photo?: string;
  phones: { type: string; number: string }[];
  emails: { type: string; address: string }[];
  addresses: { type: string; street: string; city: string; state: string; zip: string; country: string }[];
  notes?: string;
  birthday?: string;
  socialProfiles: { type: string; username: string }[];
  labels: string[];
  favorite: boolean;
}

interface ContactGroup {
  id: string;
  name: string;
  contacts: string[];
}

// ============================================================================
// Mock Data
// ============================================================================

const mockContacts: Contact[] = [
  {
    id: '1',
    firstName: 'Alice',
    lastName: 'Anderson',
    company: 'Hanzo AI',
    photo: 'https://i.pravatar.cc/150?img=1',
    phones: [
      { type: 'mobile', number: '+1 (555) 123-4567' },
      { type: 'work', number: '+1 (555) 234-5678' },
    ],
    emails: [
      { type: 'work', address: 'alice@hanzo.ai' },
      { type: 'personal', address: 'alice.anderson@email.com' },
    ],
    addresses: [
      { type: 'home', street: '123 Main St', city: 'San Francisco', state: 'CA', zip: '94102', country: 'USA' },
    ],
    notes: 'Met at the AI conference. Interested in collaboration.',
    birthday: '1990-03-15',
    socialProfiles: [
      { type: 'twitter', username: '@alice_ai' },
      { type: 'linkedin', username: 'alice-anderson' },
    ],
    labels: ['Work', 'AI'],
    favorite: true,
  },
  {
    id: '2',
    firstName: 'Bob',
    lastName: 'Baker',
    company: 'Lux Network',
    photo: 'https://i.pravatar.cc/150?img=3',
    phones: [{ type: 'mobile', number: '+1 (555) 345-6789' }],
    emails: [{ type: 'work', address: 'bob@lux.network' }],
    addresses: [
      { type: 'work', street: '456 Tech Blvd', city: 'Austin', state: 'TX', zip: '78701', country: 'USA' },
    ],
    socialProfiles: [{ type: 'github', username: 'bob-baker' }],
    labels: ['Blockchain'],
    favorite: false,
  },
  {
    id: '3',
    firstName: 'Carol',
    lastName: 'Chen',
    company: 'Zoo Labs',
    photo: 'https://i.pravatar.cc/150?img=5',
    phones: [
      { type: 'mobile', number: '+1 (555) 456-7890' },
      { type: 'home', number: '+1 (555) 567-8901' },
    ],
    emails: [
      { type: 'work', address: 'carol@zoo.ngo' },
    ],
    addresses: [
      { type: 'home', street: '789 Research Way', city: 'Boston', state: 'MA', zip: '02101', country: 'USA' },
    ],
    notes: 'Research lead for DeSci initiatives.',
    socialProfiles: [
      { type: 'twitter', username: '@carol_science' },
    ],
    labels: ['Research', 'Science'],
    favorite: true,
  },
  {
    id: '4',
    firstName: 'David',
    lastName: 'Davis',
    company: 'TechCorp',
    photo: 'https://i.pravatar.cc/150?img=7',
    phones: [{ type: 'work', number: '+1 (555) 678-9012' }],
    emails: [{ type: 'work', address: 'david@techcorp.com' }],
    addresses: [],
    socialProfiles: [],
    labels: ['Vendor'],
    favorite: false,
  },
  {
    id: '5',
    firstName: 'Emma',
    lastName: 'Edwards',
    photo: 'https://i.pravatar.cc/150?img=9',
    phones: [{ type: 'mobile', number: '+1 (555) 789-0123' }],
    emails: [{ type: 'personal', address: 'emma.e@email.com' }],
    addresses: [
      { type: 'home', street: '321 Oak Lane', city: 'Seattle', state: 'WA', zip: '98101', country: 'USA' },
    ],
    socialProfiles: [{ type: 'instagram', username: 'emma_creates' }],
    labels: ['Friend'],
    favorite: false,
  },
  {
    id: '6',
    firstName: 'Frank',
    lastName: 'Fisher',
    company: 'StartupXYZ',
    photo: 'https://i.pravatar.cc/150?img=11',
    phones: [{ type: 'mobile', number: '+1 (555) 890-1234' }],
    emails: [{ type: 'work', address: 'frank@startupxyz.io' }],
    addresses: [],
    socialProfiles: [],
    labels: ['Startup'],
    favorite: false,
  },
  {
    id: '7',
    firstName: 'Grace',
    lastName: 'Garcia',
    company: 'Hanzo AI',
    photo: 'https://i.pravatar.cc/150?img=13',
    phones: [
      { type: 'work', number: '+1 (555) 901-2345' },
    ],
    emails: [
      { type: 'work', address: 'grace@hanzo.ai' },
    ],
    addresses: [
      { type: 'work', street: '100 AI Plaza', city: 'San Francisco', state: 'CA', zip: '94103', country: 'USA' },
    ],
    notes: 'Engineering lead.',
    socialProfiles: [
      { type: 'github', username: 'grace-codes' },
    ],
    labels: ['Work', 'AI'],
    favorite: true,
  },
];

const mockGroups: ContactGroup[] = [
  { id: '1', name: 'Work', contacts: ['1', '2', '7'] },
  { id: '2', name: 'Family', contacts: [] },
  { id: '3', name: 'Friends', contacts: ['5'] },
  { id: '4', name: 'AI Team', contacts: ['1', '3', '7'] },
];

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ============================================================================
// Contacts Window Component
// ============================================================================

const ContactsWindow: React.FC<ContactsWindowProps> = ({ onClose, onFocus }) => {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [groups] = useState<ContactGroup[]>(mockGroups);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(mockContacts[0]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Contact>>({});

  // Filter and sort contacts
  const filteredContacts = useMemo(() => {
    let result = contacts;

    // Filter by group
    if (selectedGroup) {
      const group = groups.find(g => g.id === selectedGroup);
      if (group) {
        result = result.filter(c => group.contacts.includes(c.id));
      }
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.firstName.toLowerCase().includes(query) ||
        c.lastName.toLowerCase().includes(query) ||
        c.company?.toLowerCase().includes(query) ||
        c.emails.some(e => e.address.toLowerCase().includes(query))
      );
    }

    // Sort alphabetically
    return result.sort((a, b) => {
      const nameA = `${a.lastName} ${a.firstName}`.toLowerCase();
      const nameB = `${b.lastName} ${b.firstName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [contacts, selectedGroup, searchQuery, groups]);

  // Group contacts by first letter
  const groupedContacts = useMemo(() => {
    const groups: { [key: string]: Contact[] } = {};
    filteredContacts.forEach(contact => {
      const letter = contact.lastName.charAt(0).toUpperCase();
      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(contact);
    });
    return groups;
  }, [filteredContacts]);

  const toggleFavorite = (contactId: string) => {
    setContacts(contacts.map(c =>
      c.id === contactId ? { ...c, favorite: !c.favorite } : c
    ));
    if (selectedContact?.id === contactId) {
      setSelectedContact({ ...selectedContact, favorite: !selectedContact.favorite });
    }
  };

  const deleteContact = (contactId: string) => {
    setContacts(contacts.filter(c => c.id !== contactId));
    if (selectedContact?.id === contactId) {
      setSelectedContact(null);
    }
  };

  const startEditing = () => {
    if (selectedContact) {
      setEditForm(selectedContact);
      setIsEditing(true);
    }
  };

  const saveEditing = () => {
    if (editForm.id) {
      setContacts(contacts.map(c =>
        c.id === editForm.id ? { ...c, ...editForm } as Contact : c
      ));
      setSelectedContact({ ...selectedContact!, ...editForm } as Contact);
    }
    setIsEditing(false);
    setEditForm({});
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const getPhoneIcon = (type: string) => {
    return <Phone className="w-4 h-4" />;
  };

  const getEmailIcon = (type: string) => {
    return <Mail className="w-4 h-4" />;
  };

  return (
    <ZWindow
      title="Contacts"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 130, y: 70 }}
      initialSize={{ width: 900, height: 600 }}
      windowType="system"
    >
      <div className="flex h-full bg-black/90">
        {/* Sidebar - Groups */}
        <div className="w-48 bg-white/[0.03] backdrop-blur-xl border-r border-white/[0.08] flex flex-col">
          <div className="p-2 border-b border-white/[0.08]">
            <button
              onClick={() => setSelectedGroup(null)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                !selectedGroup
                  ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                  : 'text-white/70 hover:bg-white/[0.05] hover:text-white/90'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>All Contacts</span>
              <span className="ml-auto text-white/40 text-xs">{contacts.length}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <h3 className="text-white/40 text-[10px] uppercase tracking-wider px-3 py-2 font-medium">Groups</h3>
            {groups.map(group => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                  selectedGroup === group.id
                    ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                    : 'text-white/70 hover:bg-white/[0.05] hover:text-white/90'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>{group.name}</span>
                <span className="ml-auto text-white/40 text-xs">{group.contacts.length}</span>
              </button>
            ))}
          </div>

          <div className="p-2 border-t border-white/[0.08]">
            <button className="w-full flex items-center gap-2 px-3 py-2 text-white/50 hover:text-white/80 text-sm rounded-lg hover:bg-white/[0.05] transition-all duration-200">
              <Plus className="w-4 h-4" />
              <span>New Group</span>
            </button>
          </div>
        </div>

        {/* Contact List */}
        <div className="w-64 bg-white/[0.02] backdrop-blur-xl border-r border-white/[0.08] flex flex-col">
          {/* Search */}
          <div className="p-2 border-b border-white/[0.08]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts..."
                className="w-full bg-white/[0.06] backdrop-blur border border-white/[0.1] rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all duration-200"
              />
            </div>
          </div>

          {/* Alphabetical List */}
          <div className="flex-1 overflow-y-auto">
            {alphabet.map(letter => {
              const contactsForLetter = groupedContacts[letter];
              if (!contactsForLetter || contactsForLetter.length === 0) return null;

              return (
                <div key={letter}>
                  <div className="sticky top-0 bg-black/80 backdrop-blur-sm px-3 py-1 border-b border-white/[0.05]">
                    <span className="text-white/50 text-xs font-medium">{letter}</span>
                  </div>
                  {contactsForLetter.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => {
                        setSelectedContact(contact);
                        setIsEditing(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-all duration-200 ${
                        selectedContact?.id === contact.id
                          ? 'bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                          : 'hover:bg-white/[0.05]'
                      }`}
                    >
                      {contact.photo ? (
                        <img
                          src={contact.photo}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-white/80 text-sm font-medium ring-1 ring-white/10">
                          {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white/90 text-sm truncate">
                          {contact.lastName}, {contact.firstName}
                        </p>
                        {contact.company && (
                          <p className="text-white/40 text-xs truncate">{contact.company}</p>
                        )}
                      </div>
                      {contact.favorite && (
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              );
            })}

            {filteredContacts.length === 0 && (
              <div className="flex items-center justify-center h-32 text-white/30 text-sm">
                No contacts found
              </div>
            )}
          </div>

          {/* Add Contact Button */}
          <div className="p-2 border-t border-white/[0.08]">
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/[0.08] hover:bg-white/[0.12] text-white/90 rounded-lg transition-all duration-200 text-sm border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          </div>
        </div>

        {/* Contact Detail */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white/[0.01]">
          {selectedContact ? (
            <>
              {/* Header - Glass Card */}
              <div className="m-4 mb-0 p-4 rounded-xl bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {selectedContact.photo ? (
                      <img
                        src={selectedContact.photo}
                        alt=""
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-white/20 shadow-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-white text-2xl font-medium ring-2 ring-white/20 shadow-lg">
                        {selectedContact.firstName.charAt(0)}{selectedContact.lastName.charAt(0)}
                      </div>
                    )}
                    <div>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editForm.firstName || ''}
                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                            className="bg-white/[0.08] border border-white/[0.15] rounded-lg px-3 py-1.5 text-white text-lg focus:outline-none focus:border-white/30 transition-all"
                            placeholder="First Name"
                          />
                          <input
                            type="text"
                            value={editForm.lastName || ''}
                            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                            className="bg-white/[0.08] border border-white/[0.15] rounded-lg px-3 py-1.5 text-white text-lg focus:outline-none focus:border-white/30 transition-all"
                            placeholder="Last Name"
                          />
                        </div>
                      ) : (
                        <h2 className="text-white text-xl font-medium">
                          {selectedContact.firstName} {selectedContact.lastName}
                        </h2>
                      )}
                      {selectedContact.company && !isEditing && (
                        <p className="text-white/50 flex items-center gap-1.5 mt-0.5">
                          <Building className="w-4 h-4" />
                          {selectedContact.company}
                        </p>
                      )}
                      {isEditing && (
                        <input
                          type="text"
                          value={editForm.company || ''}
                          onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                          className="mt-2 bg-white/[0.08] border border-white/[0.15] rounded-lg px-3 py-1.5 text-white/70 text-sm w-full focus:outline-none focus:border-white/30 transition-all"
                          placeholder="Company"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isEditing ? (
                      <>
                        <button
                          onClick={cancelEditing}
                          className="p-2 hover:bg-white/[0.08] rounded-lg transition-all duration-200"
                          title="Cancel"
                        >
                          <X className="w-5 h-5 text-white/50" />
                        </button>
                        <button
                          onClick={saveEditing}
                          className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-all duration-200 border border-emerald-500/30"
                          title="Save"
                        >
                          <Check className="w-5 h-5 text-emerald-400" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleFavorite(selectedContact.id)}
                          className="p-2 hover:bg-white/[0.08] rounded-lg transition-all duration-200"
                          title={selectedContact.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        >
                          <Star className={`w-5 h-5 ${selectedContact.favorite ? 'text-amber-400 fill-amber-400' : 'text-white/50'}`} />
                        </button>
                        <button
                          onClick={startEditing}
                          className="p-2 hover:bg-white/[0.08] rounded-lg transition-all duration-200"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5 text-white/50" />
                        </button>
                        <button
                          onClick={() => deleteContact(selectedContact.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5 text-red-400/70" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Details - Glass Cards */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Phone Numbers */}
                {selectedContact.phones.length > 0 && (
                  <div className="p-4 rounded-xl bg-white/[0.04] backdrop-blur border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    <h3 className="text-white/40 text-[10px] uppercase tracking-wider mb-3 font-medium">Phone</h3>
                    <div className="space-y-2">
                      {selectedContact.phones.map((phone, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.05] transition-all duration-200">
                          <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center">
                            {getPhoneIcon(phone.type)}
                          </div>
                          <div>
                            <a
                              href={`tel:${phone.number}`}
                              className="text-white/90 hover:text-white transition-colors"
                            >
                              {phone.number}
                            </a>
                            <p className="text-white/40 text-xs capitalize">{phone.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emails */}
                {selectedContact.emails.length > 0 && (
                  <div className="p-4 rounded-xl bg-white/[0.04] backdrop-blur border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    <h3 className="text-white/40 text-[10px] uppercase tracking-wider mb-3 font-medium">Email</h3>
                    <div className="space-y-2">
                      {selectedContact.emails.map((email, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.05] transition-all duration-200">
                          <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center">
                            {getEmailIcon(email.type)}
                          </div>
                          <div>
                            <a
                              href={`mailto:${email.address}`}
                              className="text-white/90 hover:text-white transition-colors"
                            >
                              {email.address}
                            </a>
                            <p className="text-white/40 text-xs capitalize">{email.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Addresses */}
                {selectedContact.addresses.length > 0 && (
                  <div className="p-4 rounded-xl bg-white/[0.04] backdrop-blur border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    <h3 className="text-white/40 text-[10px] uppercase tracking-wider mb-3 font-medium">Address</h3>
                    <div className="space-y-2">
                      {selectedContact.addresses.map((address, index) => (
                        <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/[0.05] transition-all duration-200">
                          <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <MapPin className="w-4 h-4 text-white/60" />
                          </div>
                          <div>
                            <p className="text-white/80">{address.street}</p>
                            <p className="text-white/80">{address.city}, {address.state} {address.zip}</p>
                            <p className="text-white/80">{address.country}</p>
                            <p className="text-white/40 text-xs capitalize mt-1">{address.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Profiles */}
                {selectedContact.socialProfiles.length > 0 && (
                  <div className="p-4 rounded-xl bg-white/[0.04] backdrop-blur border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    <h3 className="text-white/40 text-[10px] uppercase tracking-wider mb-3 font-medium">Social</h3>
                    <div className="space-y-2">
                      {selectedContact.socialProfiles.map((profile, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.05] transition-all duration-200">
                          <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center">
                            <Globe className="w-4 h-4 text-white/60" />
                          </div>
                          <div>
                            <p className="text-white/90">{profile.username}</p>
                            <p className="text-white/40 text-xs capitalize">{profile.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedContact.notes && (
                  <div className="p-4 rounded-xl bg-white/[0.04] backdrop-blur border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    <h3 className="text-white/40 text-[10px] uppercase tracking-wider mb-3 font-medium">Notes</h3>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {selectedContact.notes}
                    </p>
                  </div>
                )}

                {/* Labels */}
                {selectedContact.labels.length > 0 && (
                  <div className="p-4 rounded-xl bg-white/[0.04] backdrop-blur border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                    <h3 className="text-white/40 text-[10px] uppercase tracking-wider mb-3 font-medium">Labels</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedContact.labels.map((label, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white/[0.08] text-white/80 text-xs rounded-full border border-white/[0.1]"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/30">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/[0.1]">
                  <User className="w-10 h-10 opacity-40" />
                </div>
                <p className="text-lg text-white/50">Select a contact</p>
                <p className="text-sm mt-2 text-white/30">Choose from the list or add a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Contacts app manifest
 */
export const ContactsManifest = {
  identifier: 'ai.hanzo.contacts',
  name: 'Contacts',
  version: '1.0.0',
  description: 'Address book for zOS',
  category: 'productivity' as const,
  permissions: ['storage'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 900, height: 600 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Contacts menu bar configuration
 */
export const ContactsMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newContact', label: 'New Contact', shortcut: '⌘N' },
        { type: 'item' as const, id: 'newGroup', label: 'New Group', shortcut: '⇧⌘N' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'import', label: 'Import...', shortcut: '⌘I' },
        { type: 'item' as const, id: 'export', label: 'Export vCard...', shortcut: '⌘E' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'print', label: 'Print...', shortcut: '⌘P' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close', shortcut: '⌘W' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { type: 'item' as const, id: 'undo', label: 'Undo', shortcut: '⌘Z' },
        { type: 'item' as const, id: 'redo', label: 'Redo', shortcut: '⇧⌘Z' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'cut', label: 'Cut', shortcut: '⌘X' },
        { type: 'item' as const, id: 'copy', label: 'Copy', shortcut: '⌘C' },
        { type: 'item' as const, id: 'paste', label: 'Paste', shortcut: '⌘V' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'editContact', label: 'Edit Contact', shortcut: '⌘E' },
        { type: 'item' as const, id: 'delete', label: 'Delete', shortcut: '⌘⌫' },
      ],
    },
    {
      id: 'card',
      label: 'Card',
      items: [
        { type: 'item' as const, id: 'addField', label: 'Add Field' },
        { type: 'item' as const, id: 'addPhoto', label: 'Add Photo...' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'markAsFavorite', label: 'Mark as Favorite', shortcut: '⌘.' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'sendEmail', label: 'Send Email' },
        { type: 'item' as const, id: 'sendMessage', label: 'Send Message' },
        { type: 'item' as const, id: 'startCall', label: 'Start Call' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'showGroups', label: 'Show Groups', shortcut: '⇧⌘G' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'sortByFirst', label: 'Sort by First Name' },
        { type: 'item' as const, id: 'sortByLast', label: 'Sort by Last Name' },
        { type: 'item' as const, id: 'sortByCompany', label: 'Sort by Company' },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { type: 'item' as const, id: 'minimize', label: 'Minimize', shortcut: '⌘M' },
        { type: 'item' as const, id: 'zoom', label: 'Zoom' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { type: 'item' as const, id: 'contactsHelp', label: 'Contacts Help' },
      ],
    },
  ],
};

/**
 * Contacts dock configuration
 */
export const ContactsDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'newContact', label: 'New Contact' },
    { type: 'item' as const, id: 'search', label: 'Search Contacts...' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Contacts App definition for registry
 */
export const ContactsApp = {
  manifest: ContactsManifest,
  component: ContactsWindow,
  icon: Users,
  menuBar: ContactsMenuBar,
  dockConfig: ContactsDockConfig,
};

export default ContactsWindow;
