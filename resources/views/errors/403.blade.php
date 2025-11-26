@extends('errors::branded')

@section('title', __('Forbidden'))
@section('code', '403')
@section('message', __('Access to this resource is forbidden.'))
@section('description', 'You don\'t have the necessary permissions to access this page. If you think you should have access, please contact your administrator.')