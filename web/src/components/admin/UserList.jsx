import React from 'react';
import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { Input, Table, message } from 'antd';
import MediaQuery from 'react-responsive';
import bp from '../../core/mq-breakpoints';
import EditListActionButton from '../lib/EditListActionButton';
import LinkButton from '../lib/LinkButton';
import ContentPanel from './content/ContentPanel';

const { Search } = Input;

const propTypes = {
  searchValue: PropTypes.string,
  onLoad: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  users: PropTypes.array,
  pagination: PropTypes.object.isRequired,
  roles: PropTypes.object.isRequired,
};

const defaultProps = {
  searchValue: null,
  loading: false,
  error: null,
  users: [],
};

function getTableColumns(smallWidth, onEdit, roles) {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      render: (text, user) => <LinkButton onClick={() => onEdit(user.id)}>{user.name}</LinkButton>,
    },
  ];

  const extraColumns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '30%',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: '15%',
      render: (text, user) => roles[user.role],
    },
    {
      title: 'Active',
      dataIndex: 'isAtive',
      key: 'isActive',
      width: '15%',
      render: (text, user) => (user.isActive ? 'Yes' : 'No'),
    },
  ];

  if (!smallWidth) {
    columns.push(...extraColumns);
  }

  columns.push({
    title: 'Edit',
    key: 'edit',
    width: smallWidth ? '5%' : '10%',
    render: (text, user) => <EditListActionButton onClick={() => onEdit(user.id)} />,
  });

  return columns;
}

class UserList extends React.Component {
  async componentDidMount() {
    await this.props.onLoad();
  }

  render() {
    const { loading, error } = this.props;
    const { pagination, onEdit, roles } = this.props;
    const users = toJS(this.props.users);

    if (error) {
      message(error);
    }

    return (
      <ContentPanel>
        <div className="UserList">
          <div className="UserSearchPanel">
            <div>
              <Search
                className="UserSearchInput"
                placeholder="Search..."
                defaultValue={this.props.searchValue}
                onSearch={this.props.onSearch}
              />
            </div>
          </div>
          <div>
            <MediaQuery maxWidth={bp.sm.maxWidth}>
              {(smallWidth) => {
                pagination.size = smallWidth ? 'small' : 'large';

                return (
                  <Table
                    size="middle"
                    rowKey="id"
                    loading={{ delay: 500, spinning: loading }}
                    locale={{ emptyText: 'No users found' }}
                    pagination={pagination}
                    dataSource={users}
                    columns={getTableColumns(smallWidth, onEdit, roles)}
                  />
                );
              }}
            </MediaQuery>
          </div>
        </div>
      </ContentPanel>
    );
  }
}

UserList.propTypes = propTypes;
UserList.defaultProps = defaultProps;

function mapStateToProps(s) {
  const { users: us } = s.appStore;

  return {
    searchValue: us.query.search,
    onLoad: () => us.load(),
    onSearch: search => us.search(search),
    onEdit: id => us.editUser(id),
    loading: us.loading,
    error: us.error,
    users: us.users,
    pagination: us.pagination,
    roles: us.roles,
  };
}

export default inject(mapStateToProps)(observer(UserList));
