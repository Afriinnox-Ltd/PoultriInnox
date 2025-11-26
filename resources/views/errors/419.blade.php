@extends('errors::branded')

@section('title', __('Page Expired'))
@section('code', '419')
@section('message', __('Your session has expired.'))
@section('description', 'For security reasons, your session has timed out. Please refresh the page and try again.')