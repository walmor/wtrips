import React from 'react';
import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { Button, Input, Table, Radio, DatePicker, Spin, message, Icon } from 'antd';
import MediaQuery from 'react-responsive';
import moment from 'moment';
import config from '../../core/config';
import bp from '../../core/mq-breakpoints';
import UserSelector from './UserSelector';
import TripModal from './TripModal';
import EditListActionButton from '../lib/EditListActionButton';
import DeleteListActionButton from '../lib/DeleteListActionButton';
import LinkButton from '../lib/LinkButton';
import ContentPanel from './content/ContentPanel';
import getDaysLeftText from '../../core/get-days-left-text';

const { Search } = Input;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const propTypes = {
  query: PropTypes.object.isRequired,
  onLoad: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onFilter: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  trips: PropTypes.array,
  pagination: PropTypes.object.isRequired,
  canManageUserTrips: PropTypes.bool.isRequired,
  userSelector: PropTypes.object.isRequired,
};

const defaultProps = {
  loading: false,
  error: null,
  trips: [],
};

function getTableColumns(smallWidth, onEdit, onDelete, canManageUserTrips) {
  const columns = [
    {
      title: 'Destination',
      dataIndex: 'destination',
      key: 'destination',
      width: '30%',
      render: (text, trip) => (
        <LinkButton onClick={() => onEdit(trip.id)}>{trip.destination}</LinkButton>
      ),
    },
  ];

  const extraColumns = [
    {
      title: 'Start date',
      dataIndex: 'startDate',
      key: 'startDate',
      width: '15%',
      render: (text, trip) => moment(trip.startDate).format(config.dateFormat),
    },
    {
      title: 'End date',
      dataIndex: 'endDate',
      key: 'endDate',
      width: '15%',
      render: (text, trip) => moment(trip.endDate).format(config.dateFormat),
    },
    {
      title: 'Days left',
      dataIndex: 'daysLeft',
      key: 'daysLeft',
      width: '10%',
      render: (text, trip) => getDaysLeftText(trip),
    },
  ];

  if (!smallWidth) {
    if (canManageUserTrips) {
      columns.push({
        title: 'Traveler',
        dataIndex: 'user',
        key: 'user',
        width: '20%',
        render: (text, trip) => trip.user.name,
      });
    }

    columns.push(...extraColumns);
  }

  const Actions = observer(({ trip }) => (
    <span>
      {trip.deleting && <Spin indicator={<Icon type="loading" />} size="small" />}
      {!trip.deleting && <EditListActionButton onClick={() => onEdit(trip.id)} />}
      {!trip.deleting && <DeleteListActionButton className="DeleteTripActionButton" onConfirm={() => onDelete(trip.id)} />}
    </span>
  ));

  columns.push({
    title: 'Actions',
    key: 'actions',
    align: 'center',
    width: smallWidth ? '5%' : '10%',
    render: (text, trip) => <Actions trip={trip} />,
  });

  return columns;
}

class TripList extends React.Component {
  async componentDidMount() {
    this.props.onLoad();
  }

  componentDidUpdate(prevProps) {
    const { error } = this.props;
    if (!prevProps.error && error) {
      message.error(error);
    }
  }

  handleUserFilterChanged = (input) => {
    this.props.onFilter({ user: input.target.value });
  };

  handleDateFilterChanged = (field, input) => {
    this.props.onFilter({ [field]: input ? input.format('YYYY-MM-DD') : null });
  };

  render() {
    const {
      loading,
      pagination,
      onCreate,
      onEdit,
      onDelete,
      query,
      canManageUserTrips,
      userSelector,
    } = this.props;

    const trips = toJS(this.props.trips);

    const userFilter = query.user || 'all';
    const startDate = query.startDate ? moment(query.startDate) : null;
    const endDate = query.endDate ? moment(query.endDate) : null;

    return (
      <ContentPanel>
        <TripModal />
        <div>
          <div className="TripSearchPanel">
            <div>
              <Button className="CreateTripButton" type="primary" onClick={onCreate}>
                Create trip
              </Button>
            </div>
            <div>
              {canManageUserTrips && (
                <React.Fragment>
                  <RadioGroup
                    className="u-marginRight"
                    value={userFilter}
                    onChange={this.handleUserFilterChanged}
                  >
                    <RadioButton value="all">All trips</RadioButton>
                    <RadioButton value="me">My trips</RadioButton>
                  </RadioGroup>
                  <UserSelector className="u-marginRight" {...userSelector.mappedProps} />
                </React.Fragment>
              )}
              <DatePicker
                className="TripListDateFilter"
                placeholder="From"
                format={config.dateFormat}
                value={startDate}
                onChange={date => this.handleDateFilterChanged('startDate', date)}
              />
              <DatePicker
                className="TripListDateFilter"
                placeholder="To"
                format={config.dateFormat}
                value={endDate}
                onChange={date => this.handleDateFilterChanged('endDate', date)}
              />
            </div>
            <div>
              <Search
                className="TripSearchInput"
                placeholder="Search..."
                defaultValue={query.search}
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
                    locale={{ emptyText: 'No trips found' }}
                    pagination={pagination}
                    dataSource={trips}
                    columns={getTableColumns(smallWidth, onEdit, onDelete, canManageUserTrips)}
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

TripList.propTypes = propTypes;
TripList.defaultProps = defaultProps;

function mapStateToProps(s) {
  const { trips, auth } = s.appStore;
  return {
    query: trips.query,
    onLoad: () => trips.load(),
    onSearch: search => trips.search(search),
    onFilter: data => trips.filter(data),
    onCreate: () => trips.createTrip(),
    onEdit: id => trips.editTrip(id),
    onDelete: id => trips.deleteTrip(id),
    loading: trips.loading,
    error: trips.error,
    trips: trips.trips,
    pagination: trips.pagination,
    canManageUserTrips: auth.canManageUserTrips,
    userSelector: trips.userSelector,
  };
}

export default inject(mapStateToProps)(observer(TripList));
