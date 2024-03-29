// Code generated by mockery v2.38.0. DO NOT EDIT.

package mocks

import (
	functions "github.com/smartcontractkit/chainlink/v2/core/services/gateway/handlers/functions"
	mock "github.com/stretchr/testify/mock"

	pg "github.com/smartcontractkit/chainlink/v2/core/services/pg"
)

// ORM is an autogenerated mock type for the ORM type
type ORM struct {
	mock.Mock
}

// GetSubscriptions provides a mock function with given fields: offset, limit, qopts
func (_m *ORM) GetSubscriptions(offset uint, limit uint, qopts ...pg.QOpt) ([]functions.CachedSubscription, error) {
	_va := make([]interface{}, len(qopts))
	for _i := range qopts {
		_va[_i] = qopts[_i]
	}
	var _ca []interface{}
	_ca = append(_ca, offset, limit)
	_ca = append(_ca, _va...)
	ret := _m.Called(_ca...)

	if len(ret) == 0 {
		panic("no return value specified for GetSubscriptions")
	}

	var r0 []functions.CachedSubscription
	var r1 error
	if rf, ok := ret.Get(0).(func(uint, uint, ...pg.QOpt) ([]functions.CachedSubscription, error)); ok {
		return rf(offset, limit, qopts...)
	}
	if rf, ok := ret.Get(0).(func(uint, uint, ...pg.QOpt) []functions.CachedSubscription); ok {
		r0 = rf(offset, limit, qopts...)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]functions.CachedSubscription)
		}
	}

	if rf, ok := ret.Get(1).(func(uint, uint, ...pg.QOpt) error); ok {
		r1 = rf(offset, limit, qopts...)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// UpsertSubscription provides a mock function with given fields: subscription, qopts
func (_m *ORM) UpsertSubscription(subscription functions.CachedSubscription, qopts ...pg.QOpt) error {
	_va := make([]interface{}, len(qopts))
	for _i := range qopts {
		_va[_i] = qopts[_i]
	}
	var _ca []interface{}
	_ca = append(_ca, subscription)
	_ca = append(_ca, _va...)
	ret := _m.Called(_ca...)

	if len(ret) == 0 {
		panic("no return value specified for UpsertSubscription")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func(functions.CachedSubscription, ...pg.QOpt) error); ok {
		r0 = rf(subscription, qopts...)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// NewORM creates a new instance of ORM. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewORM(t interface {
	mock.TestingT
	Cleanup(func())
}) *ORM {
	mock := &ORM{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
