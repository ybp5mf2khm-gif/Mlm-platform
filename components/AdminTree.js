'use client';

import React, { useState } from 'react';

function TreeNode({ node, level = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return React.createElement(
    'div',
    {
      style: {
        marginRight: level > 0 ? '20px' : '0',
        marginTop: '10px',
        borderRight: level > 0 ? '2px dashed #cbd5e1' : 'none',
        paddingRight: level > 0 ? '14px' : '0',
      },
    },
    React.createElement(
      'div',
      {
        style: {
          backgroundColor: level === 0 ? '#0f172a' : '#f8fafc',
          color: level === 0 ? '#ffffff' : '#0f172a',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
        },
      },
      React.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
        hasChildren
          ? React.createElement(
              'button',
              {
                onClick: () => setExpanded(!expanded),
                style: {
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                },
              },
              expanded ? '−' : '+'
            )
          : React.createElement(
              'span',
              { style: { width: '24px', textAlign: 'center', color: '#94a3b8' } },
              '•'
            ),
        React.createElement(
          'div',
          null,
          React.createElement(
            'div',
            { style: { fontWeight: 'bold', fontSize: '14px' } },
            node.full_name || 'بدون اسم',
            React.createElement(
              'span',
              {
                style: {
                  marginRight: '8px',
                  fontSize: '11px',
                  backgroundColor: level === 0 ? '#334155' : '#e2e8f0',
                  color: level === 0 ? '#e2e8f0' : '#475569',
                  padding: '2px 6px',
                  borderRadius: '4px',
                },
              },
              'مستوى ' + level
            )
          ),
          React.createElement(
            'div',
            {
              style: {
                fontSize: '11px',
                color: level === 0 ? '#94a3b8' : '#64748b',
                marginTop: '2px',
              },
            },
            node.email + ' • ',
            React.createElement(
              'span',
              {
                style: {
                  fontFamily: 'monospace',
                  color: level === 0 ? '#60a5fa' : '#2563eb',
                },
              },
              node.referral_code
            )
          )
        )
      ),
      React.createElement(
        'div',
        { style: { textAlign: 'left', fontSize: '11px' } },
        React.createElement(
          'div',
          {
            style: {
              fontWeight: 'bold',
              color: node.status === 'ACTIVE' ? '#16a34a' : '#dc2626',
            },
          },
          node.status === 'ACTIVE' ? 'نشط' : 'موقوف'
        ),
        hasChildren
          ? React.createElement(
              'div',
              {
                style: {
                  color: level === 0 ? '#cbd5e1' : '#64748b',
                  marginTop: '2px',
                },
              },
              'الفريق: ' + node.children.length
            )
          : null
      )
    ),
    hasChildren && expanded
      ? React.createElement(
          'div',
          null,
          node.children.map((child) =>
            React.createElement(TreeNode, {
              key: child.id,
              node: child,
              level: level + 1,
            })
          )
        )
      : null
  );
}

export default function AdminTree({ users }) {
  const buildTree = (list) => {
    const map = {};
    const codeMap = {};
    const roots = [];

    list.forEach((u) => {
      map[u.id] = { ...u, children: [] };
      if (u.referral_code) codeMap[u.referral_code] = u.id;
    });

    list.forEach((u) => {
      const parentId =
        u.sponsor_id ||
        u.referrer_id ||
        u.referred_by ||
        u.parent_id ||
        (u.referred_by_code ? codeMap[u.referred_by_code] : null);

      if (parentId && map[parentId] && parentId !== u.id) {
        map[parentId].children.push(map[u.id]);
      } else {
        roots.push(map[u.id]);
      }
    });

    return roots;
  };

  const treeData = buildTree(users || []);

  return React.createElement(
    'div',
    {
      style: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        border: '1px solid #e5e7eb',
      },
    },
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '10px',
        },
      },
      React.createElement(
        'h2',
        { style: { fontSize: '15px', fontWeight: 'bold', margin: 0, color: '#0f172a' } },
        'شجرة الشبكة والتسلسل الهرمي'
      ),
      React.createElement(
        'span',
        { style: { fontSize: '12px', color: '#64748b' } },
        'إجمالي الأعضاء: ' + users.length
      )
    ),
    treeData.length === 0
      ? React.createElement(
          'p',
          {
            style: {
              textAlign: 'center',
              color: '#64748b',
              fontSize: '13px',
              padding: '20px 0',
            },
          },
          'لا يوجد أعضاء لعرضهم في الشجرة'
        )
      : treeData.map((rootNode) =>
          React.createElement(TreeNode, {
            key: rootNode.id,
            node: rootNode,
            level: 0,
          })
        )
  );
}
