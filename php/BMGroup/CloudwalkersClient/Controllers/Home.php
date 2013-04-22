<?php
class BMGroup_CloudwalkersClient_Controllers_Home
	extends BMGroup_CloudwalkersClient_Controllers_Base
{
	public function getContent ()
	{
		$client = BMGroup_CloudwalkersClient_Client::getInstance ();
		if (!$client->isLogin ())
		{
			//return '<p>Please login.</p>' . Neuron_URLBuilder::getUrl ('login');
			$client->logout (Neuron_URLBuilder::getURL('login'));
		}

		$userdata = $client->get ('user/me');

		$page = new Neuron_Core_Template ();
		$page->set ('user', $userdata);
		
		$notifications = $client->get ('account/' . $userdata['id'] . '/notifications');
		if(DEBUG) print_r($notifications, true);

		return $page->parse ('modules/cloudwalkersclient/pages/home/home.phpt');
	}
}