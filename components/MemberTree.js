'use client';

import React, { useState } from 'react';

const e = React.createElement;

function TreeNode({ node, level }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return e(
    'div',
    {
      style: {
        marginLeft: level > 0 ? 18 : 0,
        marginTop: 8,
        borderLeft: level > 0 ? '2px dashed #cbd5e0' : 'none',
        paddingLeft: level > 0 ? 12 : 0,
      },
    },
    e(
      'div',
      {
        style: {
          background: level === 0 ? '#2b6cb0' : '#f7fafc',
          color: level === 0 ? '#fff' : '#1a202c',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
      },
      e(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        hasChildren
          ? e(
              'button',
              {
                type: 'button',
                onClick: () => setExpanded(!expanded),
                style: {
                  width: 22,
                  height: 22,
                  borderRadius: 5,
                  border: 'none',
                  background: level === 0 ? '#fff' : '#2b6cb0',
                  color: level === 0 ? '#2b6cb0' : '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                },
              },
              expanded ? '−' : '+'
            )
          : e('span', { style: { width: 22, textAlign: 'center', color: '#a0aec0' } }, '•'),
        e(
          'div',
          null,
          e(
            'div',
            { style: { fontWeight: 'bold', fontSize: 13 } },
            node.name,
            e(
              'span',
              {
                style: {
                  marginLeft: 6,
                  fontSize: 10,
                  background: level === 0 ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                  color: level === 0 ? '#fff' : '#4a5568',
                  padding: '2px 6px',
                  borderRadius: 4,
                },
              },
              level === 0 ? 'You' : 'Level ' + level
            )
          ),
          node.referral_code
            ? e(
                'div',
                {
                  style: {
                    fontSize: 11,
                    color: level === 0 ? '#bee3f8' : '#718096',
                    fontFamily: 'monospace',
                    marginTop: 2,
                  },
                },
                node.referral_code
              )
            : null
        )
      ),
      e(
        'div',
        { style: { textAlign: 'right', fontSize: 11 } },
        node.status
          ? e(
              'div',
              {
                style: {
                  fontWeight: 'bold',
                  color: level === 0 ? '#c6f6d5' : node.status === 'ACTIVE' ? '#2f855a' : '#c53030',
                },
              },
              node.status
            )
          : null,
        hasChildren
          ? e(
              'div',
              { style: { color: level === 0 ? '#e2e8f0' : '#718096', fontSize: 10 } },
              'Team: ' + node.children.length
            )
          : null
      )
    ),
    hasChildren && expanded
      ? e(
          'div',
          null,
          node.children.map((child) => e(TreeNode, { key: child.id, node: child, level: level + 1 }))
        )
      : null
  );
}

export default function MemberTree({ user, profile, team }) {
  const root = {
    id: user.id,
    name: profile?.full_name || 'You',
    referral_code: profile?.referral_code || '',
    status: profile?.status || 'ACTIVE',
    children: [],
  };

  const map = { [user.id]: root };
  team.forEach((t) => {
    map[t.id] = { ...t, children: [] };
  });

  team.forEach((t) => {
    if (t.sponsor_id && map[t.sponsor_id]) {
      map[t.sponsor_id].children.push(map[t.id]);
    } else if (t.depth === 1) {
      root.children.push(map[t.id]);
    }
  });

  return e(
    'div',
    { style: { background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } },
    e('h4', { style: { marginTop: 0, marginBottom: 10 } }, 'My Team Tree (' + team.length + ')'),
    team.length === 0
      ? e('p', { style: { color: '#718096', fontSize: 13, margin: 0 } }, 'No team members yet.')
      : e(TreeNode, { node: root, level: 0 })
  );
}
